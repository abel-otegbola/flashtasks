// Dodo Payments integration — uses dodopayments-checkout npm package
// Install: npm install dodopayments-checkout
import { DodoPayments } from 'dodopayments-checkout';

export type DodoCheckoutOptions = {
  email?: string;
  name?: string;
  metadata?: Record<string, string | number | null>;
};

export type DodoCheckoutResult = {
  payment_id?: string;
  subscription_id?: string;
  transaction_id?: string;
  customer_id?: string;
  [key: string]: unknown;
};

let initialized = false;

/**
 * Initialize the Dodo Payments SDK.
 * Safe to call multiple times — re-initialization is skipped.
 */
export function loadDodo(_publicKey?: string): void {
  if (initialized) return;

  const mode = (import.meta.env.VITE_DODO_PAYMENTS_ENVIRONMENT === 'test_mode' ||
                import.meta.env.DEV)
    ? 'test'
    : 'live';

  DodoPayments.Initialize({
    mode,
    displayType: 'overlay',
    onEvent: () => {
      // Surface events to the console in dev; consume them in openDodoCheckout below
      if (import.meta.env.DEV) {
      }
    },
  });

  initialized = true;
}

/**
 * Create a checkout session on your backend, then open the Dodo overlay.
 * Resolves with the payment/subscription data on success.
 * Rejects with Error('checkout-closed') if the user dismisses the overlay.
 * Rejects with the error event payload on payment errors.
 */
export async function openDodoCheckout(
  productId: string,
  options: DodoCheckoutOptions = {}
): Promise<DodoCheckoutResult> {
  // 1. Ask your backend to create a checkout session and return a checkoutUrl
  const sessionRes = await fetch('/api/dodo/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      email: options.email,
      name: options.name,
      metadata: options.metadata ?? {},
    }),
  });

  if (!sessionRes.ok) {
    const err = await sessionRes.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Failed to create checkout session');
  }

  const { checkoutUrl } = await sessionRes.json();

  if (!checkoutUrl) {
    throw new Error('No checkout URL returned from server');
  }

  // 2. Open the overlay and wait for a terminal event
  return new Promise<DodoCheckoutResult>((resolve, reject) => {
    // Re-initialize with event handlers bound to this promise
    const mode = (import.meta.env.VITE_DODO_PAYMENTS_ENVIRONMENT === 'test_mode' ||
                  import.meta.env.DEV)
      ? 'test'
      : 'live';

    // Re-init each time to rebind the onEvent callback for this checkout
    DodoPayments.Initialize({
      mode,
      displayType: 'overlay',
      onEvent: (event: any) => {
        if (import.meta.env.DEV) {
          console.log('[dodo] checkout event:', event);
        }

        const type: string = event?.type ?? event?.event ?? '';

        if (type === 'checkout.closed') {
          // Only reject as cancelled if no payment has succeeded yet
          reject(new Error('checkout-closed'));
        } else if (type === 'checkout.redirect' || type === 'checkout.payment_success') {
          // Payment completed — resolve with whatever data the event carries
          resolve(event?.data ?? event ?? {});
        } else if (type === 'checkout.error') {
          reject(event?.data ?? new Error('Checkout error'));
        }
      },
    });

    initialized = true;

    DodoPayments.Checkout.open({ checkoutUrl });
  });
}