export interface OrderItem {
  orderLineId?: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  variantId?: string;
  variantTitle?: string;
  selectedOptions?: Record<string, string>;
  image?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderPayment {
  transactionId?: string;
  method: string;
  paymentGatewayResponse?: unknown;
  paidAt?: string;
  paymentStatus: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  reason?: string;
}

export interface OrderCancellation {
  state: string;
  reason?: string;
  note?: string;
  requestedAt?: string;
  completedAt?: string;
  refundId?: string;
}

export interface OrderAvailableActions {
  cancel: boolean;
  return: boolean;
  retry_payment?: boolean;
  record_cod_payment?: boolean;
  issue_invoice?: boolean;
  ship?: boolean;
  mark_shipment_delivered?: boolean;
}

export interface Order {
  id: string;
  _id?: string;
  userId?: string;
  customerId?: string;
  email?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  payment: OrderPayment;
  shipping: { method: string };
  currency: string;
  fulfillmentStatus: string;
  orderNumber: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
  cancellation?: OrderCancellation;
  availableActions?: OrderAvailableActions;
}

export interface OrderReturnRequest {
  id: string;
  return_number: string;
  status: string;
  reason_summary: string;
}

type UnknownRecord = Record<string, unknown>;

const record = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const text = (...candidates: unknown[]): string => {
  const selected = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  );
  return typeof selected === "string" ? selected.trim() : "";
};

const amount = (candidate: unknown): number => {
  const parsed = typeof candidate === "number" ? candidate : Number(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fromMinor = (candidate: unknown): number => amount(candidate) / 100;

export const getOrderId = (order: Order): string => order?.id || "";

export function projectOrder(source: unknown): Order {
  const order = record(source);
  const legacyPricing = record(order.pricing);
  const sourceAddress = record(order.shippingAddress);
  const sourceBillingAddress = record(order.billingAddress || order.shippingAddress);
  const sourcePayment = record(order.payment);
  const sourceShipping = record(order.shipping);

  const address = (candidate: UnknownRecord): OrderAddress => ({
    firstName: text(candidate.firstName),
    lastName: text(candidate.lastName),
    email: text(candidate.email, order.email),
    phone: text(candidate.phone),
    addressLine1: text(candidate.addressLine1, candidate.address1),
    addressLine2: text(candidate.addressLine2, candidate.address2) || undefined,
    city: text(candidate.city),
    state: text(candidate.state),
    zipCode: text(candidate.zipCode, candidate.postalCode),
    country: text(candidate.country, candidate.countryCode),
  });

  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.lines)
      ? order.lines
      : [];
  const items: OrderItem[] = rawItems.map((raw: unknown) => {
    const item = record(raw);
    return {
      orderLineId: text(item.orderLineId, item.order_line_id) || undefined,
      productId: text(item.productId, item.product_id),
      name: text(item.name, item.title, item.label, item.sku) || "Order item",
      slug: text(item.slug),
      sku: text(item.sku),
      quantity: amount(item.quantity),
      price: item.unitPriceMinor !== undefined
        ? fromMinor(item.unitPriceMinor)
        : item.unit_price_minor !== undefined
          ? fromMinor(item.unit_price_minor)
          : amount(item.price ?? item.unitPrice),
      ...(item.compareAtPrice !== undefined
        ? { compareAtPrice: amount(item.compareAtPrice) }
        : {}),
      ...(text(item.variantId, item.variant_id)
        ? { variantId: text(item.variantId, item.variant_id) }
        : {}),
      ...(text(item.variantTitle)
        ? { variantTitle: text(item.variantTitle) }
        : {}),
      ...(item.selectedOptions && typeof item.selectedOptions === "object"
        ? { selectedOptions: record(item.selectedOptions) as Record<string, string> }
        : {}),
      ...(text(item.image) ? { image: text(item.image) } : {}),
    };
  });

  const status = text(order.status) || "pending";
  const createdAt = text(order.createdAt, order.created_at, order.placed_at);
  const updatedAt = text(order.updatedAt, order.updated_at, createdAt);

  return {
    id: text(order.id, order._id),
    userId: text(order.userId, order.user_id, order.customerId, order.customer_id) || undefined,
    customerId: text(order.customerId, order.customer_id, order.userId, order.user_id) || undefined,
    email: text(order.email, sourceAddress.email, sourceBillingAddress.email) || undefined,
    items,
    pricing: Object.keys(legacyPricing).length
      ? {
          subtotal: amount(legacyPricing.subtotal),
          shipping: amount(legacyPricing.shipping),
          discount: amount(legacyPricing.discount),
          tax: amount(legacyPricing.tax),
          total: amount(legacyPricing.total),
        }
      : {
          subtotal: fromMinor(order.subtotal_minor),
          shipping: fromMinor(order.shipping_minor),
          discount: fromMinor(order.discount_minor),
          tax: fromMinor(order.tax_minor),
          total: fromMinor(order.total_minor),
        },
    shippingAddress: address(sourceAddress),
    billingAddress: address(sourceBillingAddress),
    payment: {
      transactionId: text(sourcePayment.transactionId, sourcePayment.reference) || undefined,
      method: text(sourcePayment.method, order.paymentMethod) || "not recorded",
      paymentGatewayResponse: sourcePayment.paymentGatewayResponse,
      paidAt: text(sourcePayment.paidAt) || undefined,
      paymentStatus: text(sourcePayment.paymentStatus, order.paymentStatus, order.payment_status) || "pending",
    },
    shipping: { method: text(sourceShipping.method, order.shippingMethod) || "not recorded" },
    currency: text(order.currency) || "USD",
    fulfillmentStatus: text(order.fulfillmentStatus, order.fulfillment_status) || "unfulfilled",
    orderNumber: text(order.orderNumber, order.order_number) || text(order.id, order._id),
    statusHistory: Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [{ status, timestamp: createdAt }],
    createdAt,
    updatedAt,
    status,
    invoiceNumber: text(order.invoice_number, order.invoiceNumber) || undefined,
    invoiceIssuedAt: text(order.invoice_issued_at, order.invoiceIssuedAt) || undefined,
    cancellation: Object.keys(record(order.cancellation)).length
      ? (record(order.cancellation) as unknown as OrderCancellation)
      : undefined,
    availableActions: Object.keys(record(order.availableActions)).length
      ? {
          cancel: Boolean(record(order.availableActions).cancel),
          return: Boolean(record(order.availableActions).return),
        }
      : undefined,
  };
}

async function readResponse(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || body.error || fallback);
  }
  return body;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["auth-token"] = token;
    }
  }
  return headers;
}

export async function getOrders(userId?: string, email?: string, scope?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);
  if (email) params.set("email", email);
  if (scope) params.set("scope", scope);
  const query = params.toString();
  const response = await fetch(`/api/commerce/orders${query ? `?${query}` : ""}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const body = await readResponse(response, "Failed to fetch orders");
  const orders = Array.isArray(body) ? body : body.data || [];
  return Array.isArray(orders) ? orders.map(projectOrder) : [];
}

export async function getOrderById(id: string, token?: string): Promise<Order> {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  const headers: Record<string, string> = { ...getAuthHeaders() };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`/api/commerce/orders/${encodeURIComponent(id)}${query}`, {
    credentials: "include",
    headers,
  });
  const body = await readResponse(response, "Failed to fetch order");
  return projectOrder(body.data || body);
}

export async function cancelOrder(
  id: string,
  input: { reason: string; note?: string; idempotencyKey: string },
): Promise<Order> {
  const response = await fetch(`/api/commerce/orders/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    credentials: "include",
    body: JSON.stringify({ reason: input.reason, note: input.note }),
  });
  const body = await readResponse(response, "Failed to cancel order");
  return projectOrder(body.data || body);
}

export async function requestOrderReturn(
  id: string,
  input: {
    reasonSummary: string;
    notes?: string;
    idempotencyKey: string;
    lines: Array<{
      orderLineId: string;
      quantity: number;
      resolutionType: "refund" | "exchange";
    }>;
  },
): Promise<OrderReturnRequest> {
  const response = await fetch(`/api/commerce/orders/${encodeURIComponent(id)}/returns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    credentials: "include",
    body: JSON.stringify({
      reason_summary: input.reasonSummary,
      notes: input.notes,
      lines: input.lines.map((line) => ({
        order_line_id: line.orderLineId,
        quantity: line.quantity,
        resolution_type: line.resolutionType,
      })),
    }),
  });
  const body = await readResponse(response, "Failed to request return");
  return body.data || body;
}
