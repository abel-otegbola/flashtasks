import { CheckCircleIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";
import { useUser } from "../../../context/authContext";
import DodoSubscription from "../../../components/payment/DodoSubscription";

function Pricing() {
  const { user } = useUser();

  const pricingPlans = [
    {
        id: 'free',
        name: 'Starter',
        price: '$0',
        cadence: 'Forever free',
        accent: 'bg-slate-100 text-slate-700',
        purpose: 'Perfect for students and individuals getting started with AI-powered productivity and task management.',
        features: [
            '1 organization',
            'Unlimited personal tasks',
            'AI task organization',
            'Natural language task input',
            'Basic reminders & due dates',
            'Focus mode',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$5',
        cadence: 'Per month',
        accent: 'bg-sky-100 text-sky-700',
        purpose: 'For freelancers, creators, and professionals who want smarter planning and faster execution.',
        featured: true,
        role: 'pro',
        features: [
            'Unlimited workspaces',
            'AI task breakdown',
            'Smart daily planning',
            'AI prioritization',
            'Recurring tasks',
            'Calendar integration',
            'Productivity analytics',
            'Priority support',
        ],
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        price: '$15',
        cadence: 'Per month',
        accent: 'bg-violet-100 text-violet-700',
        purpose: 'Built for startups, agencies, and teams managing projects, collaboration, and productivity at scale.',
        role: 'team',
        features: [
            'Everything in Pro',
            'Up to 10 team members',
            'Shared workspaces',
            'Task assignments',
            'Team activity tracking',
            'AI meeting summaries',
            'Collaborative projects',
            'Advanced permissions',
        ],
    },
  ];

  const currentRole = (user as any)?.prefs?.role || 'free';
  const isCurrentPlan = (planId: string) => currentRole === planId;

  const renderCta = (plan: any) => {
    if (plan.id === 'free') {
      return (
        <Button
          href={user ? undefined : "/signup"}
          variant="secondary"
          className="w-full justify-center"
        >
          Start Free
        </Button>
      );
    }

    if (!user) {
      return (
        <Button
          href="/signup"
          variant={plan.featured ? 'primary' : 'secondary'}
          className="w-full justify-center"
        >
          Sign up to subscribe
        </Button>
      );
    }

    if (isCurrentPlan(plan.id)) {
      return (
        <Button
          variant="secondary"
          className="w-full justify-center"
          disabled
        >
          Current Plan
        </Button>
      );
    }

    return (
      <DodoSubscription
        role={plan.role as 'pro' | 'enterprise'}
        label={`Upgrade to ${plan.name}`}
        className="w-full"
      />
    );
  };

  return (
    <div className="min-h-screen">

      {/* Pricing Cards */}
       <section className="flex flex-col gap-6 md:rounded-[10px] h-full md:m-0 mx-2 mb-4">
            <div className="flex justify-between gap-6 items-start flex-wrap bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-500/[0.1] dark:border-gray-500/[0.2]">
                <div className="flex flex-col gap-3">
                <h1 className="font-medium md:text-[24px] text-[18px] leading-[120%]">
                    Pricing
                </h1>
                <p>Start free, scale as you close more tasks, or lock in a one-time founders deal.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5 w-full rounded-lg">
                {pricingPlans.map((plan) => (
                    <article
                        key={plan.id}
                        className={`relative rounded-2xl border bg-white dark:bg-dark-bg p-6 flex flex-col gap-5 bg-background ${plan.featured ? 'border-primary shadow-xl shadow-primary/10' : 'border-gray-500/[0.15]'}`}
                        
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${plan.accent}`}>{plan.name}</span>
                            {isCurrentPlan(plan.id) && (
                                <span className="text-[11px] uppercase tracking-wide text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-bold">{plan.price}</p>
                            <p className="text-sm opacity-[0.6]">{plan.cadence}</p>
                        <p className="text-sm opacity-[0.7] mt-auto">{plan.purpose}</p>
                        </div>

                        <ul className="flex flex-col flex-1 gap-2 text-sm opacity-[0.85]">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-center gap-2">
                                    <span className="text-green-500 mt-[2px]"><CheckCircleIcon /></span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {renderCta(plan)}
                    </article>
                ))}
            </div>
        </section>
    </div>
  );
}

export default Pricing;
