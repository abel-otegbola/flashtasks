import { CheckCircleIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";

function Pricing() {
const pricingPlans = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$0',
        cadence: 'Forever free',
        accent: 'bg-slate-100 text-slate-700',
        purpose: 'Perfect for students and individuals getting started with AI-powered productivity and task management.',
        features: [
            'Up to 3 workspaces',
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
        price: '$6',
        cadence: 'Per month',
        accent: 'bg-sky-100 text-sky-700',
        purpose: 'For freelancers, creators, and professionals who want smarter planning and faster execution.',
        featured: true,
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
        id: 'team',
        name: 'Team',
        price: '$15',
        cadence: 'Per month',
        accent: 'bg-violet-100 text-violet-700',
        purpose: 'Built for startups, agencies, and teams managing projects, collaboration, and productivity at scale.',
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
    {
        id: 'lifetime',
        name: 'Lifetime',
        price: '$79',
        cadence: 'One-time payment',
        accent: 'bg-amber-100 text-amber-800',
        purpose: 'One payment. Lifetime access for early adopters who want to grow with Flashtasks.',
        badge: 'Limited Offer',
        features: [
            'All Pro features',
            'Unlimited personal workspaces',
            'Future AI upgrades included',
            'Early adopter badge',
            'Priority feature access',
            'Lifetime updates',
        ],
    },
]

  return (
    <div className="min-h-screen">

      {/* Pricing Cards */}
       <section className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] p-6 h-full mb-4">
            <div className="flex justify-between gap-6 items-start flex-wrap">
                <div className="flex flex-col gap-3">
                <h1 className="font-medium md:text-[24px] text-[18px] leading-[120%]">
                    Pricing
                </h1>
                <p>Start free, scale as you close more tasks, or lock in a one-time founders deal.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5 w-full mt-8">
                {pricingPlans.map((plan) => (
                    <article
                        key={plan.id}
                        className={`relative rounded-2xl border p-6 flex flex-col gap-5 bg-background ${plan.featured ? 'border-primary shadow-xl shadow-primary/10' : 'border-gray-500/[0.15]'}`}
                        
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${plan.accent}`}>{plan.name}</span>
                            {plan.badge ? (
                                <span className="text-[11px] uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full">{plan.badge}</span>
                            ) : null}
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

                        <Button
                            href="/signup"
                            variant={plan.featured ? 'primary' : 'secondary'}
                            className="w-full justify-center"
                        >
                            {plan.id === 'starter' ? 'Start Free' : 'Choose Plan'}
                        </Button>
                    </article>
                ))}
            </div>
        </section>
    </div>
  );
}

export default Pricing;
