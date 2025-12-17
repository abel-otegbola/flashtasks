'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import { loadPaddle, openPaddleCheckout } from '../../services/paddle';
import { useUser } from '../../context/authContext';

interface Props {
  productId?: number | string;
  label?: string;
  className?: string;
}

export default function PaddleSubscription({ productId, label = 'Subscribe', className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  const vendor = import.meta.env.VITE_PADDLE_VENDOR_ID;
  const pid = productId || import.meta.env.VITE_PADDLE_PRODUCT_ID;

  useEffect(() => {
    if (!vendor) return;
    loadPaddle(vendor).then(() => setReady(true)).catch(() => setReady(false));
  }, [vendor]);

  const handleClick = async () => {
    if (!pid) {
      alert('Product ID not configured');
      return;
    }

    setLoading(true);
    try {
      await openPaddleCheckout(pid, {
        email: (user as any)?.email,
        passthrough: JSON.stringify({ 
          userId: (user as any)?.$id || null,
          productId: pid
        }),
      });

      // Notify backend to provision subscription (best-effort)
      try {
        const response = await fetch('/api/paddle/activate', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            userId: (user as any)?.$id || null,
            productId: pid
          }) 
        });
        
        if (response.ok) {
          alert('Thank you! Your subscription is now active. Please refresh the page to see your updated plan.');
          // Refresh page to update user context
          setTimeout(() => window.location.reload(), 2000);
        } else {
          throw new Error('Activation failed');
        }
      } catch (e) {
        console.warn('activation call failed', e);
        alert('Payment successful, but activation is pending. Please contact support if your plan is not updated within 5 minutes.');
      }
    } catch (e: any) {
      if (e?.message === 'checkout-closed') {
        // user closed checkout
      } else {
        console.error('Paddle checkout error', e);
        alert('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button onClick={handleClick} disabled={!ready || loading} variant="primary">
        {loading ? 'Processing...' : label}
      </Button>
      {!vendor && (
        <div className="text-xs text-red-500 mt-2">Paddle vendor ID not configured (VITE_PADDLE_VENDOR_ID)</div>
      )}
    </div>
  )
}
