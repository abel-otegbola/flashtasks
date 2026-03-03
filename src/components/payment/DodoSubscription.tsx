'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import { loadDodo, openDodoCheckout } from '../../services/dodo';
import { useUser } from '../../context/authContext';

interface Props {
  planId?: string;
  label?: string;
  className?: string;
  role?: 'pro' | 'enterprise';
}

export default function DodoSubscription({ planId, label = 'Subscribe', className = '', role }: Props) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  const publicKey = import.meta.env.VITE_DODO_PUBLIC_KEY;
  const defaultPlanId = role === 'enterprise' 
    ? import.meta.env.VITE_DODO_ENTERPRISE_PLAN_ID 
    : import.meta.env.VITE_DODO_PRO_PLAN_ID;
  const pid = planId || defaultPlanId;

  useEffect(() => {
    if (!publicKey) return;
    loadDodo(publicKey).then(() => setReady(true)).catch(() => setReady(false));
  }, [publicKey]);

  const handleClick = async () => {
    if (!pid) {
      alert('Plan ID not configured');
      return;
    }

    setLoading(true);
    try {
      const paymentData = await openDodoCheckout(pid, {
        email: (user as any)?.email,
        name: (user as any)?.name,
        metadata: { 
          userId: (user as any)?.$id || null,
          planId: pid,
          role: role || 'pro'
        },
      });

      // Notify backend to provision subscription
      try {
        const response = await fetch('/api/dodo/activate', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            userId: (user as any)?.$id || null,
            planId: pid,
            role: role || 'pro',
            transactionId: paymentData?.transaction_id,
            subscriptionId: paymentData?.subscription_id
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
        console.error('Dodo checkout error', e);
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
        <div className="text-xs text-red-500 mt-2">Dodo public key not configured (VITE_DODO_PUBLIC_KEY)</div>
      )}
    </div>
  )
}
