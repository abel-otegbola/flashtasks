import { CheckCircle, CloseCircle } from "@solar-icons/react";
import { useState } from "react";
import Button from "../../../components/button/button";
import PaddleSubscription from "../../../components/payment/PaddleSubscription";
import { useUser } from "../../../context/authContext";

interface PricingPlan {
  name: string;
  role: 'free' | 'pro' | 'enterprise';
  price: string;
  period?: string;
  description: string;
  recordingTime: string;
  features: string[];
  limitations?: string[];
  cta: string;
  popular: boolean;
  productId?: string;
  isCurrent?: boolean;
}

function PricingPage() {
  const { user } = useUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const currentUserRole = ((user as any)?.prefs?.role as string) || 'free';

  const plans: PricingPlan[] = [
    {
      name: "Free",
      role: 'free',
      price: "$0",
      description: "Perfect for individuals getting started",
      recordingTime: "10 minutes",
      features: [
        "10 minutes recording time per session",
        "Basic AI task conversion",
        "Up to 50 tasks per month",
        "7-day task history",
        "Email support",
        "Core features access"
      ],
      limitations: [
        "Limited recording time",
        "Basic AI features only",
        "Limited task history"
      ],
      cta: "Current Plan",
      popular: false,
      isCurrent: currentUserRole === 'free'
    },
    {
      name: "Professional",
      role: 'pro',
      price: billingCycle === 'monthly' ? "$29" : "$290",
      period: billingCycle === 'monthly' ? "/month" : "/year",
      description: "Best for professionals and growing teams",
      recordingTime: "20 minutes",
      features: [
        "20 minutes recording time per session",
        "Advanced AI task conversion & analytics",
        "Unlimited tasks",
        "Unlimited task history",
        "Priority support (24h response)",
        "Team collaboration tools",
        "Custom categories & tags",
        "Export to CSV/JSON",
        "Advanced search & filters"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      productId: import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID,
      isCurrent: currentUserRole === 'pro'
    },
    {
      name: "Enterprise",
      role: 'enterprise',
      price: billingCycle === 'monthly' ? "$99" : "$990",
      period: billingCycle === 'monthly' ? "/user/month" : "/user/year",
      description: "For large teams with advanced needs",
      recordingTime: "30 minutes",
      features: [
        "30 minutes recording time per session",
        "Everything in Professional",
        "Dedicated account manager",
        "Custom AI training for your domain",
        "SLA guarantee (99.9% uptime)",
        "Advanced security & compliance",
        "SSO & SAML authentication",
        "White-label options",
        "API access",
        "Custom integrations",
        "On-premise deployment option"
      ],
      cta: "Contact Sales",
      popular: false,
      productId: import.meta.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID,
      isCurrent: currentUserRole === 'enterprise'
    }
  ];

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@flashtasks.com?subject=Enterprise Plan Inquiry';
  };

  return (
    <div className="min-h-screen bg-bg-gray-100 dark:bg-dark-bg-secondary/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] md:text-[48px] font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-[16px] md:text-[18px] mb-8">
            Select the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 bg-white dark:bg-dark-bg p-2 rounded-full border border-border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'annual'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              Annual
              <span className="ml-2 text-[12px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              <div
                className={`h-full p-8 rounded-2xl border ${
                  plan.popular
                    ? 'border-primary shadow-2xl scale-105 bg-white dark:bg-dark-bg'
                    : plan.isCurrent
                    ? 'border-green-500 bg-white dark:bg-dark-bg'
                    : 'border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg'
                } relative transition-transform hover:scale-105`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[12px] font-semibold">
                    MOST POPULAR
                  </div>
                )}
                {plan.isCurrent && !plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-[12px] font-semibold">
                    CURRENT PLAN
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-[24px] font-bold mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-[40px] font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[14px]">
                    {plan.description}
                  </p>
                </div>

                {/* Recording Time Highlight */}
                <div className="mb-6 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30">
                  <div className="text-[12px] text-primary font-semibold mb-1">
                    RECORDING TIME
                  </div>
                  <div className="text-[24px] font-bold text-primary">
                    {plan.recordingTime}
                  </div>
                  <div className="text-[12px] text-gray-600 dark:text-gray-400">
                    per session
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle
                        size={20}
                        className="text-primary flex-shrink-0 mt-0.5"
                      />
                      <span className="text-[14px]">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, idx) => (
                    <li key={`limit-${idx}`} className="flex items-start gap-2">
                      <CloseCircle
                        size={20}
                        className="text-gray-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-[14px] text-gray-500 dark:text-gray-400">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-auto">
                  {plan.isCurrent ? (
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.name === "Enterprise" ? (
                    <Button
                      variant={plan.popular ? "primary" : "secondary"}
                      className="w-full justify-center"
                      onClick={handleContactSales}
                    >
                      {plan.cta}
                    </Button>
                  ) : plan.productId ? (
                    <PaddleSubscription
                      productId={plan.productId}
                      label={plan.cta}
                      className="w-full"
                    />
                  ) : (
                    <Button
                      variant={plan.popular ? "primary" : "secondary"}
                      className={`w-full justify-center ${
                        !plan.popular
                          ? 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white'
                          : ''
                      }`}
                      href="/auth/signup"
                    >
                      {plan.cta}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison Table */}
        <div className="bg-white dark:bg-dark-bg rounded-2xl p-8 border border-border-gray-100 dark:border-gray-700">
          <h2 className="text-[28px] font-bold mb-6 text-center">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-gray-100 dark:border-gray-700">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Professional</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Recording Time per Session', free: '10 min', pro: '20 min', enterprise: '30 min' },
                  { feature: 'Tasks per Month', free: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Task History', free: '7 days', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'AI Task Conversion', free: true, pro: true, enterprise: true },
                  { feature: 'Advanced AI Analytics', free: false, pro: true, enterprise: true },
                  { feature: 'Team Collaboration', free: false, pro: true, enterprise: true },
                  { feature: 'Priority Support', free: false, pro: true, enterprise: true },
                  { feature: 'Custom AI Training', free: false, pro: false, enterprise: true },
                  { feature: 'API Access', free: false, pro: false, enterprise: true },
                  { feature: 'SSO/SAML', free: false, pro: false, enterprise: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <CheckCircle size={20} className="text-primary inline" />
                        ) : (
                          <CloseCircle size={20} className="text-gray-400 inline" />
                        )
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <CheckCircle size={20} className="text-primary inline" />
                        ) : (
                          <CloseCircle size={20} className="text-gray-400 inline" />
                        )
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <CheckCircle size={20} className="text-primary inline" />
                        ) : (
                          <CloseCircle size={20} className="text-gray-400 inline" />
                        )
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-[28px] font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
              },
              {
                q: 'What happens if I exceed my recording time?',
                a: 'If you reach your recording time limit, you can upgrade to a higher plan for extended recording sessions. Your recordings are saved, but you won\'t be able to create new ones until you upgrade or wait for the next billing cycle.'
              },
              {
                q: 'Is there a free trial for paid plans?',
                a: 'Yes! Professional plan comes with a 14-day free trial. No credit card required to start.'
              },
              {
                q: 'How does billing work for annual plans?',
                a: 'Annual plans are billed once per year and offer a 17% discount compared to monthly billing. You can switch to annual billing at any time.'
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-dark-bg rounded-xl border border-border-gray-100 dark:border-gray-700"
              >
                <div className="font-semibold mb-2 text-[16px]">{faq.q}</div>
                <div className="text-gray-600 dark:text-gray-400 text-[14px]">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white">
          <h2 className="text-[24px] font-bold mb-4">
            Still have questions?
          </h2>
          <p className="mb-6 text-white/90">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => window.location.href = 'mailto:support@flashtasks.com'}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
