import { PaymentGateway, OrderPayload, OrderPayment } from "./base";
import { RazorpayGateway } from "./razorpay";
import { AuthorizeNetGateway } from "./authorizenet";

class GenericMockGateway extends PaymentGateway {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  async loadscript(): Promise<void> {}

  async initiatePayment(payload: OrderPayload, key?: string, address?: string): Promise<OrderPayment> {
    const mockId = `${this.id}_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      transactionId: mockId,
      method: this.id as any,
      paymentGatewayResponse: { status: "captured", amount: payload.amount, currency: payload.currency },
      paidAt: new Date().toISOString(),
      extra: { provider: this.id },
    };
  }
}

const gatewayRegistry: Record<string, PaymentGateway> = {
  razorpay: new RazorpayGateway(),
  authorizenet: new AuthorizeNetGateway(),
  "authorize.net": new AuthorizeNetGateway(),
  authorize_net: new AuthorizeNetGateway(),
  stripe: new GenericMockGateway("stripe", "Stripe"),
  paypal: new GenericMockGateway("paypal", "PayPal"),
};

export function getGateway(id: string): PaymentGateway {
  const normalized = (id || "").toLowerCase();
  const gw = gatewayRegistry[normalized];
  if (!gw) {
    // Return a fallback generic gateway instead of crashing checkout
    console.warn(`Payment gateway ${id} not explicitly registered, using generic mock gateway`);
    return new GenericMockGateway(normalized, id);
  }
  return gw;
}
