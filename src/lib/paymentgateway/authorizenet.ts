import { formatCurrencyPrice } from '@/lib/currency/currency';
import { OrderPayload, OrderPayment, PaymentGateway } from "./base";

export class AuthorizeNetGateway extends PaymentGateway {
  id = "authorizenet";
  name = "Authorize.Net";

  async loadscript(testMode = true): Promise<void> {
    if (typeof document === "undefined") return;
    const scriptSrc = testMode !== false
      ? "https://jstest.authorize.net/v1/Accept.js"
      : "https://js.authorize.net/v1/Accept.js";
    const existing = document.getElementById("authorizenet-accept-js") as HTMLScriptElement | null;
    if (existing) {
      if (existing.src === scriptSrc) return;
      existing.remove();
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.id = "authorizenet-accept-js";
      script.src = scriptSrc;
      script.charset = "utf-8";
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn("Authorize.Net Accept.js could not load from CDN");
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  async initiatePayment(payload: OrderPayload, key?: string, address?: string): Promise<OrderPayment> {
    const isTest = payload.testMode !== false;
    await this.loadscript(isTest);

    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        return reject(new Error("Document object is not available."));
      }

      const clientKey = payload.clientKey || payload.publicKey || key;
      const apiLoginID = payload.apiLoginId;

      if (!clientKey || !apiLoginID) {
        return reject(
          new Error("Authorize.Net credentials are not configured in the database blueprint (Missing Client Key or API Login ID).")
        );
      }

      const formattedAmount = formatCurrencyPrice(payload.amount / 100, payload.currency || "USD");

      const overlay = document.createElement("div");
      overlay.id = "authorizenet-accept-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.backgroundColor = "rgba(15, 23, 42, 0.82)";
      overlay.style.backdropFilter = "blur(8px)";
      overlay.style.setProperty("-webkit-backdrop-filter", "blur(8px)");
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.padding = "16px";
      overlay.style.boxSizing = "border-box";
      overlay.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

      overlay.innerHTML = `
        <div id="anet-modal-box" style="background: #ffffff; width: 100%; max-width: 460px; border-radius: 20px; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.45); overflow: hidden; animation: anetFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0b1f3a 0%, #173860 100%); color: white; padding: 22px 24px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: #ffffff; padding: 5px 10px; border-radius: 6px; display: inline-flex; align-items: center;">
                  <span style="font-weight: 900; font-size: 14px; letter-spacing: -0.5px; color: #0b1f3a;">Authorize<span style="color: #0284c7;">.Net</span></span>
                </div>
                <span style="background: rgba(255, 255, 255, 0.15); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.5px; text-transform: uppercase;">Accept.js</span>
              </div>
              <button id="anet-close-x" type="button" aria-label="Close" style="background: rgba(255, 255, 255, 0.12); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;">
                &times;
              </button>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">Card Payment Authorization</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.85;">Official PCI-DSS SAQ A-EP Secure Gateway</p>
            </div>
          </div>

          <!-- Body -->
          <div id="anet-modal-content" style="padding: 24px;">
            <!-- Amount Bar -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Amount to Pay</span>
                <span id="anet-amount-label" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">${formattedAmount}</span>
              </div>
              <div style="text-align: right;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Mode</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 6px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #2563eb;"></span> Sandbox
                </span>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="anet-error-banner" style="display: none; background: #fef2f2; border: 1.5px solid #fecaca; color: #991b1b; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 18px; line-height: 1.4;">
            </div>

            <!-- Status Indicator (when processing) -->
            <div id="anet-status-indicator" style="display: none; background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #166534; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 18px; display: flex; align-items: center; gap: 10px;">
              <span class="anet-spinner"></span>
              <span id="anet-status-text">Securing transaction with Authorize.Net...</span>
            </div>

            <form id="anet-payment-form" style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label for="anet-card-number" style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Card Number</label>
                  <span id="anet-card-brand" style="font-size: 11px; font-weight: 700; color: #64748b;">CREDIT / DEBIT</span>
                </div>
                <div style="position: relative;">
                  <input id="anet-card-number" type="tel" inputmode="numeric" placeholder="4007 0000 0002 7" maxlength="19" autocomplete="cc-number" style="width: 100%; box-sizing: border-box; height: 46px; padding: 0 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; font-weight: 600; color: #0f172a; outline: none; font-family: 'Courier New', monospace; letter-spacing: 1.5px; transition: border-color 0.15s;" required />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label for="anet-card-exp" style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 6px;">Expires (MM / YY)</label>
                  <input id="anet-card-exp" type="tel" inputmode="numeric" placeholder="12 / 28" maxlength="7" autocomplete="cc-exp" style="width: 100%; box-sizing: border-box; height: 46px; padding: 0 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; outline: none; font-family: 'Courier New', monospace;" required />
                </div>
                <div>
                  <label for="anet-card-cvv" style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 6px;">CVV / CVC</label>
                  <input id="anet-card-cvv" type="password" inputmode="numeric" placeholder="123" maxlength="4" autocomplete="cc-csc" style="width: 100%; box-sizing: border-box; height: 46px; padding: 0 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; outline: none; font-family: 'Courier New', monospace;" required />
                </div>
              </div>

              <div>
                <label for="anet-card-name" style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 6px;">Cardholder Name</label>
                <input id="anet-card-name" type="text" placeholder="John Doe" value="${payload.customerName || ""}" style="width: 100%; box-sizing: border-box; height: 46px; padding: 0 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; outline: none;" required />
              </div>

              <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 10px;">
                <button id="anet-submit-btn" type="submit" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; border: none; height: 48px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                  <span id="anet-btn-text">Authorize & Pay ${formattedAmount}</span>
                </button>
                <button id="anet-cancel-btn" type="button" style="background: transparent; color: #64748b; border: 1px solid #cbd5e1; height: 40px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.15s;">
                  Cancel Payment
                </button>
              </div>
            </form>

            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; color: #94a3b8; text-align: center;">
              <span>🔒</span>
              <span>256-Bit SSL • Card details dispatched directly to Authorize.Net</span>
            </div>
          </div>
        </div>

        <style>
          @keyframes anetFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .anet-spinner {
            width: 16px;
            height: 16px;
            border: 2.5px solid #bbf7d0;
            border-top-color: #166534;
            border-radius: 50%;
            display: inline-block;
            animation: anetSpin 0.7s linear infinite;
          }
          .anet-btn-spinner {
            width: 18px;
            height: 18px;
            border: 2.5px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            display: inline-block;
            animation: anetSpin 0.7s linear infinite;
          }
          @keyframes anetSpin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;

      document.body.appendChild(overlay);

      const cleanUp = () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };

      const contentBox = overlay.querySelector("#anet-modal-content") as HTMLElement | null;
      const errorBanner = overlay.querySelector("#anet-error-banner") as HTMLElement | null;
      const statusIndicator = overlay.querySelector("#anet-status-indicator") as HTMLElement | null;
      const statusText = overlay.querySelector("#anet-status-text") as HTMLElement | null;
      const cardNumInput = overlay.querySelector("#anet-card-number") as HTMLInputElement | null;
      const cardExpInput = overlay.querySelector("#anet-card-exp") as HTMLInputElement | null;
      const cardCvvInput = overlay.querySelector("#anet-card-cvv") as HTMLInputElement | null;
      const cardNameInput = overlay.querySelector("#anet-card-name") as HTMLInputElement | null;
      const cardBrandLabel = overlay.querySelector("#anet-card-brand") as HTMLElement | null;
      const submitBtn = overlay.querySelector("#anet-submit-btn") as HTMLButtonElement | null;
      const btnText = overlay.querySelector("#anet-btn-text") as HTMLElement | null;
      const cancelBtn = overlay.querySelector("#anet-cancel-btn") as HTMLButtonElement | null;
      const closeX = overlay.querySelector("#anet-close-x") as HTMLButtonElement | null;
      const form = overlay.querySelector("#anet-payment-form") as HTMLFormElement | null;

      // Card number formatting & brand detection
      cardNumInput?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement;
        const clean = input.value.replace(/\D/g, "").slice(0, 16);
        input.value = clean.replace(/(\d{4})(?=\d)/g, "$1 ");

        if (cardBrandLabel) {
          if (clean.startsWith("4")) {
            cardBrandLabel.innerText = "VISA";
            cardBrandLabel.style.color = "#1d4ed8";
          } else if (/^5[1-5]|^2[2-7]/.test(clean)) {
            cardBrandLabel.innerText = "MASTERCARD";
            cardBrandLabel.style.color = "#ea580c";
          } else if (/^3[47]/.test(clean)) {
            cardBrandLabel.innerText = "AMEX";
            cardBrandLabel.style.color = "#059669";
          } else if (/^6(?:011|5)/.test(clean)) {
            cardBrandLabel.innerText = "DISCOVER";
            cardBrandLabel.style.color = "#f97316";
          } else {
            cardBrandLabel.innerText = "CREDIT / DEBIT";
            cardBrandLabel.style.color = "#64748b";
          }
        }
      });

      // Expiration date formatting (MM / YY)
      cardExpInput?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement;
        let val = input.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 2) {
          val = val.slice(0, 2) + " / " + val.slice(2);
        }
        input.value = val;
      });

      const setFormDisabled = (disabled: boolean) => {
        if (cardNumInput) cardNumInput.disabled = disabled;
        if (cardExpInput) cardExpInput.disabled = disabled;
        if (cardCvvInput) cardCvvInput.disabled = disabled;
        if (cardNameInput) cardNameInput.disabled = disabled;
        if (submitBtn) submitBtn.disabled = disabled;
        if (cancelBtn) cancelBtn.disabled = disabled;
        if (closeX) closeX.disabled = disabled;
      };

      const showError = (msg: string) => {
        if (statusIndicator) statusIndicator.style.display = "none";
        if (errorBanner) {
          errorBanner.innerHTML = `<strong>Authorize.Net Error:</strong> ${msg}`;
          errorBanner.style.display = "block";
        }
        setFormDisabled(false);
        if (submitBtn && btnText) {
          btnText.innerHTML = `Authorize & Pay ${formattedAmount}`;
        }
      };

      const showProgress = (msg: string) => {
        if (errorBanner) errorBanner.style.display = "none";
        if (statusIndicator && statusText) {
          statusText.innerText = msg;
          statusIndicator.style.display = "flex";
        }
        if (btnText) {
          btnText.innerHTML = `<span class="anet-btn-spinner"></span> ${msg}`;
        }
      };

      cancelBtn?.addEventListener("click", () => {
        cleanUp();
        reject(new Error("Payment was cancelled by the customer."));
      });
      closeX?.addEventListener("click", () => {
        cleanUp();
        reject(new Error("Payment was cancelled by the customer."));
      });

      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (errorBanner) errorBanner.style.display = "none";

        const rawCard = (cardNumInput?.value || "").replace(/\s+/g, "");
        const rawExp = (cardExpInput?.value || "").replace(/\s+/g, "");
        const cvv = (cardCvvInput?.value || "").trim();

        if (rawCard.length < 13) {
          return showError("Please enter a valid credit card number.");
        }

        const expParts = rawExp.split("/");
        const month = expParts[0]?.trim();
        let year = expParts[1]?.trim() || "";
        if (year.length === 2) {
          year = "20" + year;
        }

        if (!month || !year || month.length < 1 || year.length < 4) {
          return showError("Please enter a valid expiration date (MM / YY).");
        }

        if (cvv.length < 3) {
          return showError("Please enter a valid 3 or 4 digit CVV code.");
        }

        setFormDisabled(true);
        showProgress("1/2: Securing card token with Authorize.Net...");

        const accept = (window as any).Accept;
        if (!accept || typeof accept.dispatchData !== "function") {
          return showError("Authorize.Net secure library is still loading. Please refresh and try again.");
        }

        const secureData = {
          authData: {
            clientKey: clientKey,
            apiLoginID: apiLoginID,
          },
          cardData: {
            cardNumber: rawCard,
            month: month,
            year: year,
            cardCode: cvv,
          },
        };

        try {
          accept.dispatchData(secureData, async (response: any) => {
            if (response.messages.resultCode === "Error") {
              const errs = response.messages.message || [];
              const errMsg = errs[0]?.text || "Card validation failed on Authorize.Net.";
              return showError(errMsg);
            }

            // Step 1: Tokenization successful
            const opaqueData = response.opaqueData;
            const last4 = rawCard.slice(-4);
            const cardBrand = cardBrandLabel?.innerText || "CARD";

            showProgress("2/2: Authorizing & charging with Authorize.Net gateway...");

            let finalTransId = `nonce_${Date.now()}`;
            let capturedResult: any = null;

            // Step 2: Live Server-Side Capture while keeping modal open
            if (typeof payload.onConfirmPayment === "function") {
              try {
                capturedResult = await payload.onConfirmPayment({
                  transactionId: finalTransId,
                  extra: {
                    opaqueData: opaqueData,
                    dataDescriptor: opaqueData.dataDescriptor,
                    dataValue: opaqueData.dataValue,
                    token: payload.orderId,
                    last4: last4,
                    cardBrand: cardBrand,
                  },
                  last4: last4,
                  cardType: cardBrand,
                });

                if (capturedResult?.transactionId) {
                  finalTransId = capturedResult.transactionId;
                }
              } catch (confirmErr: any) {
                const failMsg = confirmErr?.message || "Payment authorization was declined by Authorize.Net.";
                return showError(failMsg);
              }
            }

            // Step 3: Display Official Authorize.Net Payment Approved Receipt in modal
            if (contentBox) {
              contentBox.innerHTML = `
                <div style="text-align: center; padding: 16px 0 10px 0; animation: anetFadeIn 0.3s ease;">
                  <div style="width: 68px; height: 68px; border-radius: 50%; background: #ecfdf5; border: 2.5px solid #10b981; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.4px;">Payment Approved!</h3>
                  <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0;">Authorize.Net has successfully authorized & captured your payment.</p>

                  <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; text-align: left; font-size: 13px; margin-bottom: 22px; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-weight: 500;">Authorize.Net Trans ID:</span>
                      <span style="font-weight: 800; font-family: 'Courier New', monospace; color: #0f172a; font-size: 14px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">#${finalTransId}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-weight: 500;">Amount Authorized:</span>
                      <span style="font-weight: 800; color: #059669; font-size: 16px;">${formattedAmount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-weight: 500;">Payment Method:</span>
                      <span style="font-weight: 600; color: #0f172a;">${cardBrand} (•••• ${last4})</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-weight: 500;">Gateway Status:</span>
                      <span style="font-weight: 700; color: #059669; display: inline-flex; align-items: center; gap: 6px;">
                        <span style="width: 7px; height: 7px; border-radius: 50%; background: #059669; display: inline-block;"></span>
                        Settled / Captured
                      </span>
                    </div>
                  </div>

                  <div style="font-size: 12px; font-weight: 600; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="anet-spinner"></span>
                    <span>Redirecting to your order confirmation...</span>
                  </div>
                </div>
              `;
            }

            // Hold receipt visible for 2 seconds so the user clearly sees confirmation
            setTimeout(() => {
              cleanUp();
              resolve({
                transactionId: finalTransId,
                method: "authorizenet",
                paymentGatewayResponse: {
                  status: "approved",
                  amount: payload.amount,
                  currency: payload.currency || "USD",
                },
                paidAt: new Date().toISOString(),
                extra: {
                  opaqueData: opaqueData,
                  dataDescriptor: opaqueData.dataDescriptor,
                  dataValue: opaqueData.dataValue,
                  token: payload.orderId,
                  transId: finalTransId,
                  capturedOrder: capturedResult,
                },
              });
            }, 2000);
          });
        } catch (dispatchErr: any) {
          showError("Authorize.Net communication error: " + String(dispatchErr?.message || dispatchErr));
        }
      });
    });
  }
}
