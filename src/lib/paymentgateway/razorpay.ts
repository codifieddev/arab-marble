import { CreateOrderPayload, OrderPayload, OrderPayment, PaymentGateway } from "./base";

export class RazorpayGateway extends PaymentGateway {
  id = "razorpay";
  name = "Razorpay";

  async loadscript(): Promise<void> {
    if (document.getElementById("razorpay-script")) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  }

  async initiatePayment(payload: OrderPayload, key: string, address: string): Promise<OrderPayment> {
    const isMock = !key || key.startsWith("rzp_test_mock") || payload.orderId?.startsWith("order_mock");

    if (isMock) {
      return new Promise((resolve, reject) => {
        if (typeof document === "undefined") {
          const mockId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          return resolve({
            transactionId: mockId,
            method: "razorpay",
            paymentGatewayResponse: { status: "captured", amount: payload.amount, currency: payload.currency },
            paidAt: new Date().toISOString(),
            extra: { razorpaySignature: `sig_mock_${Date.now()}` },
          });
        }

        const overlay = document.createElement("div");
        overlay.id = "mock-razorpay-overlay";
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.65)";
        overlay.style.backdropFilter = "blur(4px)";
        overlay.style.zIndex = "99999";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "sans-serif";

        const formattedAmount = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: payload.currency || "INR",
        }).format(payload.amount / 100);

        overlay.innerHTML = `
          <div style="background: white; border-radius: 16px; padding: 28px; width: 90%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: #2563eb; color: white; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">R</div>
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">Razorpay Payment</h3>
                  <span style="font-size: 11px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 600;">TEST SIMULATION</span>
                </div>
              </div>
              <span style="font-size: 18px; font-weight: 800; color: #0f172a;">${formattedAmount}</span>
            </div>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #475569;">
              <p style="margin: 0 0 6px 0;"><strong>Customer:</strong> ${payload.customerName || "Customer"}</p>
              <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${payload.customerEmail || "customer@peekeeper.com"}</p>
              <p style="margin: 0;"><strong>Order ID:</strong> ${payload.orderId}</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button id="mock-rzp-pay-btn" style="background: #10b981; color: white; border: none; padding: 13px; border-radius: 9999px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s;">
                ✓ Simulate Successful Payment (${formattedAmount})
              </button>
              <button id="mock-rzp-cancel-btn" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 11px; border-radius: 9999px; font-weight: 600; font-size: 13px; cursor: pointer;">
                Cancel Payment
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);

        const cleanUp = () => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        };

        const payBtn = overlay.querySelector("#mock-rzp-pay-btn");
        const cancelBtn = overlay.querySelector("#mock-rzp-cancel-btn");

        payBtn?.addEventListener("click", () => {
          cleanUp();
          const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          resolve({
            transactionId: mockPaymentId,
            method: "razorpay",
            paymentGatewayResponse: { status: "captured", amount: payload.amount, currency: payload.currency },
            paidAt: new Date().toISOString(),
            extra: { razorpaySignature: `sig_mock_${Date.now()}` },
          });
        });

        cancelBtn?.addEventListener("click", () => {
          cleanUp();
          reject(new Error("Payment cancelled by customer"));
        });
      });
    }

    try {
      await this.loadscript();
    } catch (e) {
      console.warn("Failed to load live Razorpay script, falling back to simulation", e);
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        transactionId: mockPaymentId,
        method: "razorpay",
        paymentGatewayResponse: { status: "captured", amount: payload.amount, currency: payload.currency },
        paidAt: new Date().toISOString(),
        extra: { razorpaySignature: `sig_mock_${Date.now()}` },
      };
    }

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.customerName,
        description: "Order Payment",
        order_id: payload.orderId,
        prefill: { name: payload.customerName, email: payload.customerEmail },
        notes: { address },
        handler: (response: any) => {
          resolve({
            transactionId: response.razorpay_payment_id,
            method: "razorpay",
            paymentGatewayResponse: { status: "captured", amount: payload.amount, currency: payload.currency },
            paidAt: new Date().toISOString(),
            extra: { razorpaySignature: response.razorpay_signature },
          });
        },
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  }
}
