// Lightweight Paddle loader and helper
export function loadPaddle(vendorId: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    // @ts-ignore
    if ((window as any).Paddle) {
      try { (window as any).Paddle.Setup({ vendor: Number(vendorId) }); } catch {}
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      try { (window as any).Paddle.Setup({ vendor: Number(vendorId) }); } catch (e) {}
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export function openPaddleCheckout(productId: number | string, options: any = {}) {
  // expects paddle script loaded and Paddle.Setup called
  // @ts-ignore
  const Paddle = (window as any).Paddle;
  if (!Paddle) throw new Error('Paddle not loaded');

  return new Promise<void>((resolve, reject) => {
    try {
      Paddle.Checkout.open({
        product: Number(productId),
        ...options,
        successCallback: (data: any) => {
          resolve();
        },
        closeCallback: () => {
          // closed without purchase
          reject(new Error('checkout-closed'));
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
