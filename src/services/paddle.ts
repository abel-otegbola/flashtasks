// Paddle Payments integration
export function loadPaddle(publicKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    // @ts-ignore
    if ((window as any).Paddle) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      try { 
        // @ts-ignore
        window.Paddle?.Setup({ token: publicKey }); 
      } catch (e) {
        console.error('Paddle init error:', e);
      }
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export function openPaddleCheckout(priceId: string, options: any = {}) {
  // expects Paddle script loaded and initialized
  // @ts-ignore
  const Paddle = (window as any).Paddle;
  if (!Paddle) throw new Error('Paddle Payments not loaded');

  return new Promise<any>((resolve, reject) => {
    try {
      // @ts-ignore
      Paddle.Checkout.open({
        items: [{ priceId: priceId }],
        customer: {
          email: options.email,
          name: options.name
        },
        customData: options.customData || {},
        settings: {
          allowLogout: false,
          displayMode: 'overlay'
        },
        onComplete: (data: any) => {
          resolve(data);
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
