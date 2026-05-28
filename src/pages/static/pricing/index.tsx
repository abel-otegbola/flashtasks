import { CheckCircleIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "Forever free",
    accent: "bg-slate-100 text-slate-700",
    text: "Perfect for students and individuals getting started with AI-powered productivity.",
    features: ["Unlimited personal tasks", "AI task organization", "Natural language input"],
  },
  {
    name: "Pro",
    price: "$6",
    cadence: "Per month",
    accent: "bg-sky-100 text-sky-700",
    text: "For professionals who want smarter planning and faster execution.",
    featured: true,
    features: ["AI task breakdown", "Smart daily planning", "Productivity analytics"],
  },
  {
    name: "Team",
    price: "$15",
    cadence: "Per month",
    accent: "bg-violet-100 text-violet-700",
    text: "Built for teams managing collaboration and projects at scale.",
    features: ["Shared workspaces", "Task assignments", "Advanced permissions"],
  },
];

function PricingPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100">
      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.16),_transparent_42%),linear-gradient(180deg,_rgba(246,246,246,0.7),_rgba(246,246,246,0.2))] dark:bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.18),_transparent_42%),linear-gradient(180deg,_rgba(28,28,32,0.95),_rgba(28,28,32,0.75))]" />
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <BlurReveal preset="slide-up" className="inline-flex items-center gap-2 rounded-full border border-gray-500/20 px-6 py-2 font-medium">
            Pricing
          </BlurReveal>

          <h1 className="mt-6 max-w-2xl md:text-[32px] text-[28px] font-medium leading-[120%]">
            Simple pricing that scales with your workflow.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-gray-500 dark:text-gray-300 sm:text-lg">
            Start free, upgrade when you need more, or choose a team plan for collaboration.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/auth/signup">Start free</Button>
            <Button href="/integrations" variant="secondary">See integrations</Button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Animate key={plan.name} preset="zoomIn" duration={2} delay={index * 0.15} className={`flex flex-col gap-5 rounded-2xl border p-8 ${plan.featured ? 'border-primary bg-white shadow-xl shadow-primary/10 dark:bg-dark-bg' : 'border-gray-500/20 bg-white dark:bg-dark/[0.4]'}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.accent}`}>{plan.name}</span>
                {plan.featured ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Popular</span> : null}
              </div>

              <div>
                <p className="text-4xl font-bold">{plan.price}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.cadence}</p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{plan.text}</p>
              </div>

              <ul className="flex flex-1 flex-col gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500"><CheckCircleIcon /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button href="/auth/signup" variant={plan.featured ? 'primary' : 'secondary'} className="w-full justify-center">
                Choose {plan.name}
              </Button>
            </Animate>
          ))}
        </div>
      </section>
    </main>
  );
}

export default PricingPage;