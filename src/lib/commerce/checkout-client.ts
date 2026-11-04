export type StorefrontAddress = {
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  email?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  zipCode?: unknown;
  country?: unknown;
};

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone: string;
};

type ApiEnvelope<T> = {
  data?: T;
  detail?: string;
  message?: string;
  error?: string;
};

export type CheckoutQuote = {
  id: string;
  checksum: string;
  pricing: {
    subtotalMinor: number;
    discountMinor: number;
    shippingMinor: number;
    taxMinor: number;
    totalMinor: number;
    currency: string;
  };
};

export type CheckoutOrder = {
  id: string;
  orderNumber?: string;
  orderAccessToken?: string;
  currency?: string;
  total_minor?: number;
  status?: string;
  paymentStatus?: string;
};

export type CheckoutPaymentIntent = {
  id: string;
  orderId: string;
  provider: string;
  amountMinor: number;
  currency: string;
  gatewayOrderId: string;
  publicKey: string;
  key?: string;
  apiLoginId?: string;
  clientKey?: string;
  testMode?: boolean;
};

const COUNTRY_CODES: Record<string, string> = {
  India: "IN",
  "United States": "US",
  Canada: "CA",
  "United Kingdom": "GB",
  Australia: "AU",
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function toCheckoutAddress(
  address: StorefrontAddress,
): CheckoutAddress {
  const country = text(address.country) || "India";
  return {
    firstName: text(address.firstName),
    lastName: text(address.lastName),
    address1: text(address.addressLine1),
    ...(text(address.addressLine2)
      ? { address2: text(address.addressLine2) }
      : {}),
    city: text(address.city),
    ...(text(address.state) ? { state: text(address.state) } : {}),
    postalCode: text(address.zipCode),
    countryCode: COUNTRY_CODES[country] || country.toUpperCase().slice(0, 2),
    phone: text(address.phone),
  };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
          "auth-token": token,
        };
      }
    } catch {}
  }
  return {};
}

async function readApi<T>(response: Response, fallback: string): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || !body.data) {
    throw new Error(body.detail || body.message || body.error || fallback);
  }
  return body.data;
}

export async function createCheckoutQuote(input: {
  email: string;
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  couponCode?: string;
  currency?: string;
}) {
  const response = await fetch("/api/commerce/checkout/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return readApi<CheckoutQuote>(response, "Unable to calculate a secure checkout quote.");
}

export async function captureCartContact(input: {
  email: string;
  phone?: string;
  marketingConsent?: boolean;
}) {
  const response = await fetch("/api/commerce/cart/contact", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return readApi<{ captured: boolean; cartId: string; email: string }>(
    response,
    "Unable to save checkout contact details.",
  );
}

export async function createCheckoutOrder(input: {
  quoteId: string;
  quoteChecksum: string;
  paymentMethod: string;
  idempotencyKey: string;
}) {
  const response = await fetch("/api/commerce/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      quoteId: input.quoteId,
      quoteChecksum: input.quoteChecksum,
      paymentMethod: input.paymentMethod,
    }),
  });
  return readApi<CheckoutOrder>(response, "Unable to create the order safely.");
}

export async function createCheckoutPaymentIntent(input: {
  orderId: string;
  provider: string;
  idempotencyKey: string;
}) {
  const response = await fetch("/api/commerce/checkout/payment-intents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ orderId: input.orderId, provider: input.provider }),
  });
  return readApi<CheckoutPaymentIntent>(response, "Unable to initialize the payment safely.");
}

export async function captureCheckoutPayment(input: {
  orderId: string;
  transactionId: string;
  provider: string;
  gatewayOrderId?: string;
  extra?: Record<string, unknown>;
}): Promise<CheckoutOrder & { transactionId?: string; providerData?: any }> {
  const response = await fetch("/api/commerce/checkout/capture-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = (await response.json().catch(() => ({}))) as any;
  if (!response.ok || !body.data) {
    throw new Error(body.detail || body.message || body.error || "Unable to capture the payment.");
  }
  return {
    ...body.data,
    transactionId: body.transactionId || body.data?.transactionId || input.transactionId,
    providerData: body.providerData,
  };
}
