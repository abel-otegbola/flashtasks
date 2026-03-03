// Dodo Payments integration
export function loadDodo(publicKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    // @ts-ignore
    if ((window as any).DodoPayments) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://js.dodo.africa/dodo-payments.js';
    script.async = true;
    script.onload = () => {
      try { 
        (window as any).DodoPayments.init({ publicKey }); 
      } catch (e) {
        console.error('Dodo init error:', e);
      }
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export function openDodoCheckout(planId: string, options: any = {}) {
  // expects Dodo script loaded and initialized
  // @ts-ignore
  const DodoPayments = (window as any).DodoPayments;
  if (!DodoPayments) throw new Error('Dodo Payments not loaded');

  return new Promise<any>((resolve, reject) => {
    try {
      DodoPayments.checkout({
        plan: planId,
        customer_email: options.email,
        customer_name: options.name,
        metadata: options.metadata || {},
        onSuccess: (data: any) => {
          resolve(data);
        },
        onCancel: () => {
          reject(new Error('checkout-closed'));
        },
        onError: (error: any) => {
          reject(error);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
