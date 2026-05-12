'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import { loadPaddle, openPaddleCheckout } from '../../services/paddle';
import { useUser } from '../../context/authContext';

interface Props {
  productId?: string;
  priceId?: string;
  label?: string;
  className?: string;
  role?: 'pro' | 'team';
}

export default function PaddleSubscription({ productId, priceId, label = 'Subscribe', className = '', role }: Props) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  const publicKey = import.meta.env.VITE_PADDLE_PUBLIC_KEY;
  const defaultProductId = role === 'team' 
    ? import.meta.env.VITE_PADDLE_TEAM_PRODUCT_ID 
    : import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID;
  const defaultPriceId = role === 'team'
    ? import.meta.env.VITE_PADDLE_TEAM_PRICE_ID
    : import.meta.env.VITE_PADDLE_PRO_PRICE_ID;
  const pid = productId || defaultProductId;
  const priceid = priceId || defaultPriceId;

  useEffect(() => {
    if (!publicKey) return;
    loadPaddle(publicKey).then(() => setReady(true)).catch(() => setReady(false));
  }, [publicKey]);

  const handleClick = async () => {
    if (!pid) {
      alert('Product ID not configured');
      return;
    }

    setLoading(true);
    try {
      const paymentData = await openPaddleCheckout(priceid || pid, {
        email: (user as any)?.email,
        name: (user as any)?.name,
        customData: { 
          userId: (user as any)?.$id || null,
          productId: pid,
          role: role || 'pro'
        },
      });

      // Notify backend to provision subscription
      try {
        const response = await fetch('/api/paddle/activate', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            userId: (user as any)?.$id || null,
            productId: pid,
            role: role || 'pro',
            subscriptionId: paymentData?.subscription_id,
            transactionId: paymentData?.transaction_id
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
      {!publicKey && (
        <div className="text-xs text-red-500 mt-2">Paddle public key not configured (VITE_PADDLE_PUBLIC_KEY)</div>
      )}
    </div>
  )
}
