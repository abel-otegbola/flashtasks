'use client'
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../button/button';
import { loadDodo, openDodoCheckout } from '../../services/dodo';
import { useUser } from '../../context/authContext';

interface Props {
  /** Override the product ID resolved from role. Prefer setting role instead. */
  productId?: string;
  label?: string; 
  className?: string;
  role?: 'pro' | 'enterprise';
}

export default function DodoSubscription({ productId, label = 'Subscribe', className = '', role }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const publicKey = import.meta.env.VITE_DODO_PUBLIC_KEY;

  const resolvedProductId =
    productId ||
    (role === 'enterprise'
      ? import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID
      : import.meta.env.VITE_DODO_PRO_PRODUCT_ID);

  const handleClick = async () => {
    if (!resolvedProductId) {
      toast.error('Payment not configured. Please contact support.');
      return;
    }

    const userId = (user as any)?.$id ?? null;
    const userEmail = (user as any)?.email;
    const userName = (user as any)?.name;
    const effectiveRole = role ?? 'pro';

    setLoading(true);
    try {
      const paymentData = await openDodoCheckout(resolvedProductId, {
        email: userEmail,
        name: userName,
        metadata: {
          userId,
          productId: resolvedProductId,
          role: effectiveRole,
        },
      });

      // paymentData comes from DodoPayments.checkout onSuccess(data)
      const subscriptionId: string | undefined = paymentData?.subscription_id;
      const transactionId: string | undefined = paymentData?.transaction_id ?? paymentData?.payment_id;

      const activateRes = await fetch('/api/dodo/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: resolvedProductId,
          role: effectiveRole,
          transactionId: transactionId ?? null,
          subscriptionId: subscriptionId ?? null,
        }),
      });

      if (activateRes.ok) {
        toast.success('Subscription activated! Reloading…', { duration: 3000 });
        setTimeout(() => window.location.reload(), 2500);
      } else {
        const body = await activateRes.json().catch(() => ({}));
        console.error('[DodoSubscription] Activation error:', body);
        // Payment went through but backend activation failed — don't alarm the user
        toast('Payment received. Your plan will be updated shortly.', {
          icon: '⏳',
          duration: 6000,
        });
      }
    } catch (e: any) {
      if (e?.message === 'checkout-closed') {
        // user dismissed — no toast needed
      } else {
        console.error('[DodoSubscription] Checkout error:', e);
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button onClick={handleClick} disabled={loading} variant="primary">
        {loading ? 'Processing…' : label}
      </Button>
      {!publicKey && (
        <p className="text-xs text-red-500 mt-2">
          Dodo public key not configured (VITE_DODO_PUBLIC_KEY)
        </p>
      )}
    </div>
  );
}