'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { clearCart } from '@/lib/store/cart/cartSlice';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface CheckoutSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

type CheckoutStep = 0 | 1 | 2 | 3;
type CheckoutStatus = 'in-progress' | 'confirmed';

type ShippingForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type RecipientForm = {
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

// Stripe & Razorpay handle all card/UPI/bank details internally
type PaymentForm = Record<string, never>;

type CheckoutErrors = Record<string, string>;

type CheckoutStorage = {
  step: CheckoutStep;
  billing: ShippingForm;
  recipient: RecipientForm;
  shipToDifferent: boolean;
  paymentMethod: 'cod' | 'stripe' | 'razorpay';
  payment: PaymentForm;
  status: CheckoutStatus;
  orderNumber: string;
};

const CHECKOUT_STATE_KEY = 'peekeeper_checkout_state_v1';

const DEFAULT_SHIPPING: ShippingForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

const DEFAULT_RECIPIENT: RecipientForm = {
  recipientName: '',
  recipientPhone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

const DEFAULT_PAYMENT: PaymentForm = {};

function trim(value: string) {
  return value ? value.trim() : '';
}

function readCheckoutStorage(): CheckoutStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutStorage>;
    return {
      step: parsed.step === 0 || parsed.step === 1 || parsed.step === 2 || parsed.step === 3 ? parsed.step : 0,
      billing: { ...DEFAULT_SHIPPING, ...(parsed.billing || {}) },
      recipient: { ...DEFAULT_RECIPIENT, ...(parsed.recipient || {}) },
      shipToDifferent: Boolean(parsed.shipToDifferent),
      paymentMethod: parsed.paymentMethod || 'cod',
      payment: { ...DEFAULT_PAYMENT, ...(parsed.payment || {}) },
      status: parsed.status === 'confirmed' ? 'confirmed' : 'in-progress',
      orderNumber: typeof parsed.orderNumber === 'string' ? parsed.orderNumber : '',
    };
  } catch {
    return null;
  }
}

function persistCheckoutStorage(state: CheckoutStorage) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(state));
  } catch {}
}

function clearCheckoutStorage() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CHECKOUT_STATE_KEY);
  } catch {}
}

function validateBillingForm(form: ShippingForm): Partial<Record<keyof ShippingForm, string>> {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};
  if (!trim(form.firstName)) errors.firstName = 'First name is required.';
  if (!trim(form.lastName)) errors.lastName = 'Last name is required.';
  if (!trim(form.email)) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!trim(form.phone)) errors.phone = 'Phone is required.';
  if (!trim(form.address)) errors.address = 'Address is required.';
  if (!trim(form.city)) errors.city = 'City is required.';
  if (!trim(form.state)) errors.state = 'State is required.';
  if (!trim(form.zip)) errors.zip = 'ZIP Code is required.';
  if (!trim(form.country)) errors.country = 'Country is required.';
  return errors;
}

function validateRecipientForm(form: RecipientForm): Partial<Record<keyof RecipientForm, string>> {
  const errors: Partial<Record<keyof RecipientForm, string>> = {};
  if (!trim(form.recipientName)) errors.recipientName = 'Recipient name is required.';
  if (!trim(form.recipientPhone)) errors.recipientPhone = 'Recipient phone is required.';
  if (!trim(form.address)) errors.address = 'Address is required.';
  if (!trim(form.city)) errors.city = 'City is required.';
  if (!trim(form.state)) errors.state = 'State is required.';
  if (!trim(form.zip)) errors.zip = 'ZIP Code is required.';
  if (!trim(form.country)) errors.country = 'Country is required.';
  return errors;
}

function createOrderNumber() {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `PK-${Array.from(bytes, (byte) => byte.toString(36).toUpperCase()).join('')}`;
  }
  return `PK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[var(--error)]" style={{ color: 'var(--error)' }}>{message}</p>;
}

export default function CheckoutSection({ block, locale = 'en', localePrefix = '', isEditable, onSave }: CheckoutSectionProps) {
  const props = block.props || {};
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((s) => s.cart.items);
  const isPlacingOrderRef = useRef(false);
  const savedState = useMemo(() => readCheckoutStorage(), []);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(savedState?.step ?? 0);
  const [billing, setBilling] = useState<ShippingForm>(savedState?.billing ?? DEFAULT_SHIPPING);
  const [recipient, setRecipient] = useState<RecipientForm>(savedState?.recipient ?? DEFAULT_RECIPIENT);
  const [shipToDifferent, setShipToDifferent] = useState(savedState?.shipToDifferent ?? false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'razorpay'>(savedState?.paymentMethod ?? 'cod');
  const [payment, setPayment] = useState<PaymentForm>(savedState?.payment ?? DEFAULT_PAYMENT);
  const [status, setStatus] = useState<CheckoutStatus>(savedState?.status ?? 'in-progress');
  const [orderNumber, setOrderNumber] = useState(savedState?.orderNumber ?? '');
  
  // Touch & Validation States
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<Record<number, boolean>>({});
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const steps = [
    { label: t(props.stepShippingLabel, locale) || 'Details', fieldPath: 'props.stepShippingLabel' },
    { label: t(props.stepPaymentLabel, locale) || 'Payment', fieldPath: 'props.stepPaymentLabel' },
    { label: t(props.stepReviewLabel, locale) || 'Review', fieldPath: 'props.stepReviewLabel' },
    { label: t(props.stepConfirmationLabel, locale) || 'Confirmation', fieldPath: 'props.stepConfirmationLabel' },
  ];

  const billingErrors = useMemo(() => validateBillingForm(billing), [billing]);
  const recipientErrors = useMemo(() => validateRecipientForm(recipient), [recipient]);
  
  const step0Errors = useMemo(() => {
    const errs: Record<string, string> = { ...billingErrors } as Record<string, string>;
    if (shipToDifferent) {
      Object.entries(recipientErrors).forEach(([k, v]) => {
        if (v) errs[`recipient_${k}`] = v;
      });
    }
    return errs;
  }, [billingErrors, recipientErrors, shipToDifferent]);

  const step0IsValid = Object.keys(step0Errors).length === 0;
  const paymentIsValid = true;

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (fieldName: string) => {
    if (fieldName.startsWith('recipient_')) {
      if (hasAttemptedSubmit[0] || touchedFields[fieldName]) {
        return step0Errors[fieldName];
      }
      return undefined;
    }
    if (fieldName.startsWith('payment_')) {
      if (hasAttemptedSubmit[1] || touchedFields[fieldName]) {
        return undefined;
      }
      return undefined;
    }
    if (hasAttemptedSubmit[0] || touchedFields[fieldName]) {
      return step0Errors[fieldName];
    }
    return undefined;
  };

  const updateBilling = (field: keyof ShippingForm, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    setSubmissionError('');
  };

  const updateRecipient = (field: keyof RecipientForm, value: string) => {
    setRecipient((prev) => ({ ...prev, [field]: value }));
    setSubmissionError('');
  };

  const handleShippingContinue = () => {
    setHasAttemptedSubmit((prev) => ({ ...prev, 0: true }));
    if (step0IsValid) {
      setStep(1);
    }
  };

  const handlePaymentContinue = () => {
    setHasAttemptedSubmit((prev) => ({ ...prev, 1: true }));
    if (paymentIsValid) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setHasAttemptedSubmit((prev) => ({ ...prev, 0: true, 1: true }));
    if (!step0IsValid) {
      setStep(0);
      return;
    }
    if (!paymentIsValid) {
      setStep(1);
      return;
    }

    const generatedOrderNumber = createOrderNumber();
    isPlacingOrderRef.current = true;
    setIsSubmitting(true);

    try {
      // Legacy unreferenced section: direct order creation with client prices is disabled for security.
      throw new Error('Legacy checkout section is deprecated. Please use standard checkout.');
    } catch {
      setSubmissionError('We could not place your order. Please try again.');
      setStep(2);
    } finally {
      setIsSubmitting(false);
      isPlacingOrderRef.current = false;
    }
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && status !== 'confirmed' && !isPlacingOrderRef.current) {
      clearCheckoutStorage();
      router.replace(`${localePrefix}/cart`);
    }
  }, [hydrated, items.length, localePrefix, router, status]);

  useEffect(() => {
    if (!hydrated) return;
    if (step === 2 && !step0IsValid) {
      setStep(0);
      return;
    }
    if (step === 2 && !paymentIsValid) {
      setStep(1);
      return;
    }
    if (status === 'confirmed' && items.length > 0) {
      setStatus('in-progress');
      setStep(0);
      setOrderNumber('');
      setTouchedFields({});
      setHasAttemptedSubmit({});
      setSubmissionError('');
    }
  }, [hydrated, items.length, paymentIsValid, step0IsValid, step, status]);

  useEffect(() => {
    if (!hydrated) return;
    persistCheckoutStorage({
      step,
      billing,
      recipient,
      shipToDifferent,
      paymentMethod,
      payment,
      status,
      orderNumber,
    });
  }, [hydrated, step, billing, recipient, shipToDifferent, paymentMethod, payment, status, orderNumber]);
  const renderShipping = () => (
    <div>
      {onSave && isEditable ? (
        <EditableText value={t(props.shippingHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingHeading', val)} isEditable={isEditable} tag="h3" className="text-xl font-bold mb-6" placeholder="Shipping heading..." />
      ) : (
        <h3 className="text-xl font-bold mb-6">{t(props.shippingHeading, locale) || 'Billing Address Details'}</h3>
      )}

      {/* Billing Address Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingFirstNameLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingFirstNameLabel', val)} isEditable={isEditable} tag="span" placeholder="First name..." /> : t(props.shippingFirstNameLabel, locale) || 'First Name'} *
          </label>
          <input
            className={`form-input ${getFieldError('firstName') ? 'border-[var(--error)]' : ''}`}
            value={billing.firstName}
            onChange={(e) => updateBilling('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
          />
          <FieldError message={getFieldError('firstName')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingLastNameLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingLastNameLabel', val)} isEditable={isEditable} tag="span" placeholder="Last name..." /> : t(props.shippingLastNameLabel, locale) || 'Last Name'} *
          </label>
          <input
            className={`form-input ${getFieldError('lastName') ? 'border-[var(--error)]' : ''}`}
            value={billing.lastName}
            onChange={(e) => updateBilling('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
          />
          <FieldError message={getFieldError('lastName')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingEmailLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingEmailLabel', val)} isEditable={isEditable} tag="span" placeholder="Email..." /> : t(props.shippingEmailLabel, locale) || 'Email'} *
          </label>
          <input
            className={`form-input ${getFieldError('email') ? 'border-[var(--error)]' : ''}`}
            type="email"
            value={billing.email}
            onChange={(e) => updateBilling('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />
          <FieldError message={getFieldError('email')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingPhoneLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingPhoneLabel', val)} isEditable={isEditable} tag="span" placeholder="Phone..." /> : t(props.shippingPhoneLabel, locale) || 'Phone'} *
          </label>
          <input
            className={`form-input ${getFieldError('phone') ? 'border-[var(--error)]' : ''}`}
            type="tel"
            value={billing.phone}
            onChange={(e) => updateBilling('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
          />
          <FieldError message={getFieldError('phone')} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingAddressLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingAddressLabel', val)} isEditable={isEditable} tag="span" placeholder="Address..." /> : t(props.shippingAddressLabel, locale) || 'Address'} *
          </label>
          <input
            className={`form-input ${getFieldError('address') ? 'border-[var(--error)]' : ''}`}
            value={billing.address}
            onChange={(e) => updateBilling('address', e.target.value)}
            onBlur={() => handleBlur('address')}
          />
          <FieldError message={getFieldError('address')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingCityLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingCityLabel', val)} isEditable={isEditable} tag="span" placeholder="City..." /> : t(props.shippingCityLabel, locale) || 'City'} *
          </label>
          <input
            className={`form-input ${getFieldError('city') ? 'border-[var(--error)]' : ''}`}
            value={billing.city}
            onChange={(e) => updateBilling('city', e.target.value)}
            onBlur={() => handleBlur('city')}
          />
          <FieldError message={getFieldError('city')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingStateLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingStateLabel', val)} isEditable={isEditable} tag="span" placeholder="State..." /> : t(props.shippingStateLabel, locale) || 'State'} *
          </label>
          <input
            className={`form-input ${getFieldError('state') ? 'border-[var(--error)]' : ''}`}
            value={billing.state}
            onChange={(e) => updateBilling('state', e.target.value)}
            onBlur={() => handleBlur('state')}
          />
          <FieldError message={getFieldError('state')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingZipLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingZipLabel', val)} isEditable={isEditable} tag="span" placeholder="ZIP..." /> : t(props.shippingZipLabel, locale) || 'ZIP Code'} *
          </label>
          <input
            className={`form-input ${getFieldError('zip') ? 'border-[var(--error)]' : ''}`}
            value={billing.zip}
            onChange={(e) => updateBilling('zip', e.target.value)}
            onBlur={() => handleBlur('zip')}
          />
          <FieldError message={getFieldError('zip')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {onSave && isEditable ? <EditableText value={t(props.shippingCountryLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingCountryLabel', val)} isEditable={isEditable} tag="span" placeholder="Country..." /> : t(props.shippingCountryLabel, locale) || 'Country'} *
          </label>
          <input
            className={`form-input ${getFieldError('country') ? 'border-[var(--error)]' : ''}`}
            value={billing.country}
            onChange={(e) => updateBilling('country', e.target.value)}
            onBlur={() => handleBlur('country')}
          />
          <FieldError message={getFieldError('country')} />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-6 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={shipToDifferent}
          onChange={(e) => setShipToDifferent(e.target.checked)}
          className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
        />
        <span className="font-semibold text-[var(--text)]">Ship to a different address</span>
      </label>

      {/* Recipient Shipping Form Fields */}
      {shipToDifferent && (
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <h4 className="text-lg font-bold text-[var(--text)] mb-4">Recipient / Shipping Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Name *</label>
              <input
                className={`form-input ${getFieldError('recipient_recipientName') ? 'border-[var(--error)]' : ''}`}
                value={recipient.recipientName}
                onChange={(e) => updateRecipient('recipientName', e.target.value)}
                onBlur={() => handleBlur('recipient_recipientName')}
              />
              <FieldError message={getFieldError('recipient_recipientName')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Phone *</label>
              <input
                className={`form-input ${getFieldError('recipient_recipientPhone') ? 'border-[var(--error)]' : ''}`}
                value={recipient.recipientPhone}
                onChange={(e) => updateRecipient('recipientPhone', e.target.value)}
                onBlur={() => handleBlur('recipient_recipientPhone')}
              />
              <FieldError message={getFieldError('recipient_recipientPhone')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Shipping Address *</label>
              <input
                className={`form-input ${getFieldError('recipient_address') ? 'border-[var(--error)]' : ''}`}
                value={recipient.address}
                onChange={(e) => updateRecipient('address', e.target.value)}
                onBlur={() => handleBlur('recipient_address')}
              />
              <FieldError message={getFieldError('recipient_address')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                className={`form-input ${getFieldError('recipient_city') ? 'border-[var(--error)]' : ''}`}
                value={recipient.city}
                onChange={(e) => updateRecipient('city', e.target.value)}
                onBlur={() => handleBlur('recipient_city')}
              />
              <FieldError message={getFieldError('recipient_city')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input
                className={`form-input ${getFieldError('recipient_state') ? 'border-[var(--error)]' : ''}`}
                value={recipient.state}
                onChange={(e) => updateRecipient('state', e.target.value)}
                onBlur={() => handleBlur('recipient_state')}
              />
              <FieldError message={getFieldError('recipient_state')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input
                className={`form-input ${getFieldError('recipient_zip') ? 'border-[var(--error)]' : ''}`}
                value={recipient.zip}
                onChange={(e) => updateRecipient('zip', e.target.value)}
                onBlur={() => handleBlur('recipient_zip')}
              />
              <FieldError message={getFieldError('recipient_zip')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input
                className={`form-input ${getFieldError('recipient_country') ? 'border-[var(--error)]' : ''}`}
                value={recipient.country}
                onChange={(e) => updateRecipient('country', e.target.value)}
                onBlur={() => handleBlur('recipient_country')}
              />
              <FieldError message={getFieldError('recipient_country')} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button type="button" className="btn-primary" onClick={handleShippingContinue}>
          {onSave && isEditable ? <EditableText value={t(props.continueButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.continueButtonLabel', val)} isEditable={isEditable} tag="span" placeholder="Continue..." /> : t(props.continueButtonLabel, locale) || 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div>
      {onSave && isEditable ? (
        <EditableText value={t(props.paymentHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.paymentHeading', val)} isEditable={isEditable} tag="h3" className="text-xl font-bold mb-6" placeholder="Payment heading..." />
      ) : (
        <h3 className="text-xl font-bold mb-6">{t(props.paymentHeading, locale) || 'Payment Method'}</h3>
      )}

      {/* Payment Selection Radio Buttons */}
      <div className="mb-6 space-y-3">
        {[
          { id: 'cod', label: 'Cash on Delivery (COD)' },
          { id: 'stripe', label: 'Pay Online with Stripe' },
          { id: 'razorpay', label: 'Pay Online with Razorpay' },
        ].map((method) => (
          <label key={method.id} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-soft)] cursor-pointer transition-colors select-none">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === method.id}
              onChange={() => {
                setPaymentMethod(method.id as any);
                setSubmissionError('');
              }}
              className="text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm font-semibold text-[var(--text)]">{method.label}</span>
          </label>
        ))}
      </div>

      {/* Cash on Delivery (COD) Informational Banner */}
      {paymentMethod === 'cod' && (
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--accent-soft)] text-sm text-[var(--text-secondary)] mb-6">
          <p className="font-semibold text-[var(--text)] mb-1">Pay on Delivery</p>
          <p>You can pay via Cash, Card, or UPI when your order is delivered to your doorstep.</p>
        </div>
      )}

      {/* Stripe checkout info */}
      {paymentMethod === 'stripe' && (
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--accent-soft)] text-sm text-[var(--text-secondary)] mb-6">
          <p className="font-semibold text-[var(--text)] mb-1">Pay Online with Stripe</p>
          <p>You will be redirected to Stripe Checkout to securely complete your payment with Card, UPI, Net Banking, or Wallet.</p>
        </div>
      )}

      {/* Razorpay payment info */}
      {paymentMethod === 'razorpay' && (
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--accent-soft)] text-sm text-[var(--text-secondary)] mb-6">
          <p className="font-semibold text-[var(--text)] mb-1">Pay Online with Razorpay</p>
          <p>Razorpay payment modal will open to securely complete your payment with Card, UPI, Net Banking, or Wallet.</p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button type="button" className="btn-ghost" onClick={() => setStep(0)}>
          {onSave && isEditable ? <EditableText value={t(props.backButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.backButtonLabel', val)} isEditable={isEditable} tag="span" placeholder="Back..." /> : t(props.backButtonLabel, locale) || 'Back'}
        </button>
        <button type="button" className="btn-primary" onClick={handlePaymentContinue}>
          {onSave && isEditable ? <EditableText value={t(props.continueButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.continueButtonLabel', val)} isEditable={isEditable} tag="span" placeholder="Continue..." /> : t(props.continueButtonLabel, locale) || 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div>
      {onSave && isEditable ? (
        <EditableText value={t(props.reviewHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.reviewHeading', val)} isEditable={isEditable} tag="h3" className="text-xl font-bold mb-6" placeholder="Review heading..." />
      ) : (
        <h3 className="text-xl font-bold mb-6">{t(props.reviewHeading, locale) || 'Review Your Order'}</h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Billing Address Card */}
        <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-5 bg-[var(--surface)] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[var(--text)]">Billing Address</h4>
            <button type="button" className="text-xs font-semibold text-[var(--primary)] hover:underline" onClick={() => setStep(0)}>Edit</button>
          </div>
          <div className="text-sm text-[var(--text-secondary)] space-y-1">
            <p className="font-semibold text-[var(--text)]">{billing.firstName} {billing.lastName}</p>
            <p>{billing.address}</p>
            <p>{billing.city}, {billing.state} {billing.zip}</p>
            <p>{billing.country}</p>
            <p className="mt-2 text-xs italic">Email: {billing.email} &bull; Phone: {billing.phone}</p>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-5 bg-[var(--surface)] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[var(--text)]">Shipping Address</h4>
            <button type="button" className="text-xs font-semibold text-[var(--primary)] hover:underline" onClick={() => setStep(0)}>Edit</button>
          </div>
          <div className="text-sm text-[var(--text-secondary)] space-y-1">
            {shipToDifferent ? (
              <>
                <p className="font-semibold text-[var(--text)]">{recipient.recipientName}</p>
                <p>{recipient.address}</p>
                <p>{recipient.city}, {recipient.state} {recipient.zip}</p>
                <p>{recipient.country}</p>
                <p className="mt-2 text-xs italic">Phone: {recipient.recipientPhone}</p>
              </>
            ) : (
              <p className="italic text-[var(--text-muted)]">Same as Billing Address</p>
            )}
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-5 bg-[var(--surface)] shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[var(--text)]">Payment Method</h4>
            <button type="button" className="text-xs font-semibold text-[var(--primary)] hover:underline" onClick={() => setStep(1)}>Edit</button>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text)]">
              {paymentMethod === 'cod' && 'Cash on Delivery'}
              {paymentMethod === 'stripe' && 'Stripe'}
              {paymentMethod === 'razorpay' && 'Razorpay'}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
        {onSave && isEditable ? (
          <EditableText value={t(props.reviewItemsLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.reviewItemsLabel', val)} isEditable={isEditable} tag="h4" className="font-semibold mb-3" placeholder="Items label..." />
        ) : (
          <h4 className="font-semibold mb-3">{t(props.reviewItemsLabel, locale) || 'Review Items'}</h4>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-4 mt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderSubtotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderSubtotalLabel', val)} isEditable={isEditable} tag="span" placeholder="Subtotal..." /> : <span>{t(props.orderSubtotalLabel, locale) || 'Subtotal'}</span>}<span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderShippingLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderShippingLabel', val)} isEditable={isEditable} tag="span" placeholder="Shipping..." /> : <span>{t(props.orderShippingLabel, locale) || 'Shipping'}</span>}<span>{shippingCost === 0 ? (onSave && isEditable ? <EditableText value={t(props.orderShippingFreeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderShippingFreeLabel', val)} isEditable={isEditable} tag="span" placeholder="Free..." /> : t(props.orderShippingFreeLabel, locale) || 'Free') : `$${shippingCost.toFixed(2)}`}</span></div>
          <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderTaxLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderTaxLabel', val)} isEditable={isEditable} tag="span" placeholder="Tax..." /> : <span>{t(props.orderTaxLabel, locale) || 'Tax'}</span>}<span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-[var(--border)] pt-2">{onSave && isEditable ? <EditableText value={t(props.orderTotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderTotalLabel', val)} isEditable={isEditable} tag="span" placeholder="Total..." /> : <span>{t(props.orderTotalLabel, locale) || 'Total'}</span>}<span>${total.toFixed(2)}</span></div>
        </div>
      </div>

      {submissionError && <p className="mt-4 text-sm text-[var(--error)]" style={{ color: 'var(--error)' }}>{submissionError}</p>}

      <div className="flex justify-between mt-6">
        <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
          {onSave && isEditable ? <EditableText value={t(props.backButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.backButtonLabel', val)} isEditable={isEditable} tag="span" placeholder="Back..." /> : t(props.backButtonLabel, locale) || 'Back'}
        </button>
        <button type="button" className="btn-primary" onClick={handlePlaceOrder} disabled={isSubmitting}>
          {onSave && isEditable ? <EditableText value={t(props.placeOrderButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.placeOrderButtonLabel', val)} isEditable={isEditable} tag="span" placeholder="Place order..." /> : t(props.placeOrderButtonLabel, locale) || 'Place Order'}
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-12">
      <svg className="w-20 h-20 mx-auto text-green-500 mb-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {onSave && isEditable ? (
        <EditableText value={t(props.confirmationHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.confirmationHeading', val)} isEditable={isEditable} tag="h2" className="text-3xl font-bold mb-3" placeholder="Confirmation heading..." />
      ) : (
        <h2 className="text-3xl font-bold mb-3">{t(props.confirmationHeading, locale) || 'Order Confirmed!'}</h2>
      )}
      {onSave && isEditable ? (
        <EditableText value={t(props.confirmationMessage, locale) || ''} onSave={(val) => onSave(block.id, 'props.confirmationMessage', val)} isEditable={isEditable} tag="p" className="text-[var(--text-secondary)] max-w-md mx-auto mb-6" placeholder="Confirmation message..." />
      ) : (
        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">{t(props.confirmationMessage, locale) || 'Thank you for your purchase.'}</p>
      )}
      {onSave && isEditable ? (
        <EditableText value={t(props.confirmationOrderNumberLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.confirmationOrderNumberLabel', val)} isEditable={isEditable} tag="p" className="text-sm text-[var(--text-muted)] mb-2" placeholder="Order number label..." />
      ) : (
        <p className="text-sm text-[var(--text-muted)] mb-2">{t(props.confirmationOrderNumberLabel, locale) || 'Order Number'}</p>
      )}
      <p className="text-lg font-bold mb-8">{orderNumber || 'PK-UNKNOWN'}</p>
      {onSave && isEditable ? (
        <EditableText value={t(props.confirmationContinueShoppingLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.confirmationContinueShoppingLabel', val)} isEditable={isEditable} tag="span" className="btn-primary inline-flex items-center gap-2" placeholder="Continue shopping..." />
      ) : (
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          onClick={() => {
            try {
              clearCheckoutStorage();
            } catch {}
            router.push(`${localePrefix}/shop`);
          }}
        >
          {t(props.confirmationContinueShoppingLabel, locale) || 'Continue Shopping'}
        </button>
      )}
    </div>
  );

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          {onSave && isEditable ? (
            <EditableText value="Home" onSave={(val) => onSave(block.id, 'props.breadcrumbHomeLabel', val)} isEditable={isEditable} tag="span" className="hover:text-[var(--primary)]" placeholder="Home..." />
          ) : (
            <Link href={`${localePrefix}/`} className="hover:text-[var(--primary)]">Home</Link>
          )}
          <span>/</span>
          {onSave && isEditable ? (
            <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" placeholder="Breadcrumb..." />
          ) : (
            <span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale) || 'Checkout'}</span>
          )}
        </div>

        <style>{`@media (max-width:600px){.cs-steps{gap:6px!important;flex-wrap:wrap!important;justify-content:center!important}.cs-step-label{display:none!important}}`}</style>
        <div className="cs-steps flex items-center justify-center gap-2 mb-10">
          {steps.map((stepInfo, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                {i < step ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
              </div>
              <span className={`cs-step-label text-xs font-medium ${i <= step ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                {onSave && isEditable ? (
                  <EditableText value={stepInfo.label} onSave={(val) => onSave(block.id, stepInfo.fieldPath, val)} isEditable={isEditable} tag="span" placeholder="Step label..." />
                ) : (
                  stepInfo.label
                )}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-[var(--border)]" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={step === 3 ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {step === 0 && renderShipping()}
            {step === 1 && renderPayment()}
            {step === 2 && renderReview()}
            {step === 3 && renderConfirmation()}
          </div>

          {step < 3 && (
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 self-start bg-[var(--surface)] shadow-sm">
              {onSave && isEditable ? (
                <EditableText value={t(props.orderSummaryTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderSummaryTitle', val)} isEditable={isEditable} tag="h3" className="font-bold mb-4" placeholder="Order summary..." />
              ) : (
                <h3 className="font-bold mb-4">{t(props.orderSummaryTitle, locale) || 'Order Summary'}</h3>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                  <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                  <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="space-y-2 text-sm mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderSubtotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderSubtotalLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text-secondary)]" placeholder="Subtotal..." /> : <span className="text-[var(--text-secondary)]">{t(props.orderSubtotalLabel, locale) || 'Subtotal'}</span>}<span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderShippingLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderShippingLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text-secondary)]" placeholder="Shipping..." /> : <span className="text-[var(--text-secondary)]">{t(props.orderShippingLabel, locale) || 'Shipping'}</span>}<span>{shippingCost === 0 ? (onSave && isEditable ? <EditableText value={t(props.orderShippingFreeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderShippingFreeLabel', val)} isEditable={isEditable} tag="span" placeholder="Free..." /> : t(props.orderShippingFreeLabel, locale) || 'Free') : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="flex justify-between">{onSave && isEditable ? <EditableText value={t(props.orderTaxLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderTaxLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text-secondary)]" placeholder="Tax..." /> : <span className="text-[var(--text-secondary)]">{t(props.orderTaxLabel, locale) || 'Tax'}</span>}<span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-[var(--border)] pt-2">{onSave && isEditable ? <EditableText value={t(props.orderTotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderTotalLabel', val)} isEditable={isEditable} tag="span" placeholder="Total..." /> : <span>{t(props.orderTotalLabel, locale) || 'Total'}</span>}<span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

