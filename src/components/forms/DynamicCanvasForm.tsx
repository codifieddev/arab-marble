'use client';

import React, { useState, useEffect, FormEvent } from 'react';

export interface FormField {
  id?: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: Array<string | { label: string; value: string }>;
  helpText?: string;
}

export interface FormSettings {
  sendEmail?: boolean;
  notificationEmail?: string;
  successMessage?: string;
  submitButtonText?: string;
  autoReply?: boolean;
  autoReplySubject?: string;
  autoReplyBody?: string;
}

export interface CanvasFormDefinition {
  _id?: string;
  name: string;
  document_key?: string;
  purpose?: string;
  fields: FormField[];
  settings?: FormSettings;
}

export interface DynamicCanvasFormProps {
  formSlug?: string;
  formId?: string;
  heading?: string;
  subheading?: string;
  submitButtonText?: string;
  successMessage?: string;
  className?: string;
  theme?: 'card' | 'plain';
  onSuccess?: (data: any) => void;
}

const DEFAULT_CONTACT_FIELDS: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Name' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Email Address' },
  { name: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '+971 50 000 0000' },
  {
    name: 'subject',
    label: 'Subject',
    type: 'select',
    required: false,
    placeholder: 'Select inquiry type',
    options: [
      { label: 'Marble & Granite Inquiry', value: 'Marble & Granite Inquiry' },
      { label: 'Project Estimation & Supply', value: 'Project Estimation & Supply' },
      { label: 'Custom Cut to Size & Cladding', value: 'Custom Cut to Size & Cladding' },
      { label: 'Architectural Consultation', value: 'Architectural Consultation' },
      { label: 'General Inquiry', value: 'General Inquiry' },
    ],
  },
  { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Message' },
];

function resolveSafeText(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const candidate = val.en || Object.values(val)[0];
    if (typeof candidate === 'string') return candidate;
    return fallback;
  }
  return String(val);
}

export default function DynamicCanvasForm({
  formSlug = 'contact-inquiry-form',
  formId,
  heading,
  subheading,
  submitButtonText,
  successMessage,
  className = '',
  theme = 'card',
  onSuccess,
}: DynamicCanvasFormProps) {
  const [formConfig, setFormConfig] = useState<CanvasFormDefinition | null>({
    name: 'Contact & Inquiry Form',
    document_key: formSlug || 'contact-inquiry-form',
    fields: DEFAULT_CONTACT_FIELDS,
    settings: {
      successMessage: 'Thank you for reaching out to Arab Marble. Your inquiry has been received and our team will get in touch shortly.',
      submitButtonText: 'SEND MESSAGE',
    },
  });
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble';
  const identifier = formId || formSlug || 'contact-inquiry-form';

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(identifier)}`);
        if (res.ok) {
          const json = await res.json();
          const loaded: CanvasFormDefinition = json.data;
          if (isMounted && loaded && Array.isArray(loaded.fields) && loaded.fields.length > 0) {
            setFormConfig(loaded);
            setFormData((prev) => {
              const updated = { ...prev };
              loaded.fields.forEach((f) => {
                if (updated[f.name] === undefined) {
                  updated[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
                }
              });
              return updated;
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch canvas form definition, using robust fallback:', err);
      }
    }

    loadForm();

    const handleFormUpdated = (e: any) => {
      if (e.detail) {
        setFormConfig((prev) => ({
          ...prev,
          ...e.detail,
          name: e.detail.name || prev?.name || 'Contact & Inquiry Form',
          fields: Array.isArray(e.detail.fields) ? e.detail.fields : prev?.fields || DEFAULT_CONTACT_FIELDS,
          settings: {
            ...prev?.settings,
            ...(e.detail.settings || {}),
          },
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('arabmarble:form-updated', handleFormUpdated);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('arabmarble:form-updated', handleFormUpdated);
      }
    };
  }, [tenantSlug, identifier, formSlug, formId]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const submissionTarget = formConfig?._id || formId || formConfig?.document_key || formSlug || 'contact-inquiry-form';

    try {
      const payload = {
        data: formData,
        context: {
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      };

      const res = await fetch(`/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(submissionTarget)}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) onSuccess(json.data || json);
      } else {
        setErrorMsg(json.message || json.detail || json.error || 'Failed to submit the form. Please check your information and try again.');
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setErrorMsg('An unexpected network error occurred. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedHeading = resolveSafeText(heading !== undefined ? heading : (formConfig?.name || 'Send Us a Message'));
  const resolvedSubmitButtonText = resolveSafeText(submitButtonText || formConfig?.settings?.submitButtonText, 'SEND MESSAGE');
  const resolvedSuccessMessage = resolveSafeText(successMessage || formConfig?.settings?.successMessage, 'Thank you for reaching out to Arab Marble. Your inquiry has been received and our team will get in touch shortly.');

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 p-8 rounded-none bg-neutral-50 border border-neutral-200 ${className}`}>
        <div className="h-6 w-1/3 bg-neutral-200 rounded-none"></div>
        <div className="h-4 w-2/3 bg-neutral-100 rounded-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="h-10 bg-neutral-200 rounded-none"></div>
          <div className="h-10 bg-neutral-200 rounded-none"></div>
          <div className="h-10 bg-neutral-200 rounded-none col-span-full"></div>
          <div className="h-28 bg-neutral-200 rounded-none col-span-full"></div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`p-8 md:p-10 border border-emerald-200 bg-emerald-50/50 rounded-none text-left ${className}`}>
        <div className="w-12 h-12 mb-4 rounded-full bg-emerald-700 flex items-center justify-center text-white shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
          Inquiry Received
        </h3>
        <p className="text-neutral-700 text-sm max-w-lg mb-6 leading-relaxed">
          {resolvedSuccessMessage}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            const resetData: Record<string, any> = {};
            (formConfig?.fields || DEFAULT_CONTACT_FIELDS).forEach((f) => {
              resetData[f.name] = '';
            });
            setFormData(resetData);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#333333] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer rounded-none"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  const fields = formConfig?.fields || DEFAULT_CONTACT_FIELDS;

  return (
    <div className={`${theme === 'card' ? 'p-6 sm:p-8 rounded-none border border-neutral-200 bg-white shadow-sm' : ''} ${className}`}>
      {heading !== '' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 tracking-tight mb-2">
            {resolvedHeading}
          </h2>
          {subheading && (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {subheading}
            </p>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-none bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const isTextarea = field.type === 'textarea';
            const isSelect = field.type === 'select';
            const isFullWidth = isTextarea || field.name === 'subject' || field.name === 'address' || field.name === 'message';

            return (
              <div key={field.name} className={isFullWidth ? 'col-span-full' : 'col-span-1'}>
                {isTextarea ? (
                  <textarea
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    rows={5}
                    placeholder={resolveSafeText(field.placeholder || field.label, 'Message')}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 bg-white transition-colors min-h-[140px] resize-y"
                  />
                ) : isSelect ? (
                  <select
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 bg-white transition-colors"
                  >
                    <option value="">{resolveSafeText(field.placeholder || field.label, 'Select an option')}</option>
                    {(field.options || []).map((opt, i) => {
                      const val = typeof opt === 'string' ? opt : opt.value;
                      const lbl = typeof opt === 'string' ? opt : opt.label;
                      return (
                        <option key={i} value={val}>
                          {lbl}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    id={`field-${field.name}`}
                    name={field.name}
                    type={field.type || 'text'}
                    required={field.required}
                    placeholder={resolveSafeText(field.placeholder || field.label, '')}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 bg-white transition-colors"
                  />
                )}
                {field.helpText && (
                  <p className="text-xs text-neutral-500 mt-1 ml-1">{field.helpText}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#333333] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 rounded-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>{resolvedSubmitButtonText}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
