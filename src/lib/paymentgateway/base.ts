export type PaymentMethod = "cod" | "razorpay" | "stripe" | "paypal" | "authorizenet";
export type ShippingMethod = "standard" | "express" | "same_day";

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  price: number;
  compareAtPrice: number;
  variantId: string | null;
  variantTitle: string | null;
  selectedOptions: Record<string, any>;
  image: string;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  transactionId?: string;
  paymentGatewayResponse?: { status: string; amount: number; currency: string };
  paidAt?: string;
  extra?: Record<string, any>;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  pricing: OrderPricing;
  shippingAddress: Address;
  billingAddress: Address;
  payment: OrderPayment;
  shipping: { method: ShippingMethod };
  currency: string;
  fulfillmentStatus: string;
  orderNumber: string;
  statusHistory?: any[];
}

export interface OrderPayload {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  commerceOrderId?: string;
  apiLoginId?: string;
  clientKey?: string;
  publicKey?: string;
  testMode?: boolean;
  onConfirmPayment?: (tokenResult: {
    transactionId: string;
    extra?: Record<string, any>;
    last4?: string;
    cardType?: string;
  }) => Promise<any>;
}

export abstract class PaymentGateway {
  abstract id: string;
  abstract name: string;
  abstract loadscript(): Promise<void>;
  abstract initiatePayment(payload: OrderPayload, key?: string, address?: string): Promise<OrderPayment>;

  buildOrderPaymentBlock(result: OrderPayment) {
    return {
      method: result.method,
      transactionId: result.transactionId,
      paymentGatewayResponse: {
        status: result.paymentGatewayResponse?.status,
        amount: result.paymentGatewayResponse?.amount,
        currency: result.paymentGatewayResponse?.currency,
      },
      paidAt: result.paidAt,
    };
  }
}
