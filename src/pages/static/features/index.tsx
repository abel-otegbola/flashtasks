import { ArrowRightUp, Lightning } from "@solar-icons/react";
import { CalendarIcon, GridFourIcon, GridNineIcon, NetworkIcon, UsersIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const featureCards = [
  {
    title: "AI Task Breakdown",
    text: "Turn large projects into small, actionable steps with a single prompt.",
    icon: <GridNineIcon weight="light" />,
  },
  {
    title: "Smart Daily Planning",
    text: "Organize your day automatically with priority-aware scheduling.",
    icon: <CalendarIcon weight="light" />,
  },
  {
    title: "Collaborate Anywhere",
    text: "Keep teammates, clients, and study groups aligned in shared workspaces.",
    icon: <UsersIcon weight="light" />,
  },
  {
    title: "Task Automation",
    text: "Automatically create recurring tasks, route follow-ups, and trigger routine workflows from simple rules.",
    icon: <Lightning />,
    upcoming: true,
  },
  {
    title: "Integrations with Other Apps",
    text: "Connect more tools to sync data, move updates across apps, and keep work flowing in one place.",
    icon: <NetworkIcon weight="light" />,
    upcoming: true,
  },
];

function FeaturesPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100">
      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.16),_transparent_42%),linear-gradient(180deg,_rgba(246,246,246,0.7),_rgba(246,246,246,0.2))] dark:bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.18),_transparent_42%),linear-gradient(180deg,_rgba(28,28,32,0.95),_rgba(28,28,32,0.75))]" />
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <BlurReveal preset="slide-up" className="inline-flex items-center gap-2 rounded-full border border-gray-500/20 px-6 py-2 font-medium">
            <GridFourIcon />
            Features
          </BlurReveal>

          <h1 className="mt-6 max-w-2xl md:text-[32px] text-[28px] font-medium leading-[120%]">
            Built to help teams move faster with less effort.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-gray-500 dark:text-gray-300 sm:text-lg">
            Flashtasks keeps planning, prioritization, and collaboration in one simple workspace.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/auth/signup">Get started</Button>
            <Button href="/pricing" variant="secondary">See pricing</Button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card, index) => (
            <Animate key={card.title} preset="zoomIn" duration={2} delay={index * 0.15} className={`flex flex-col gap-4 border border-gray-500/20 p-8 ${index === 2 ? 'bg-primary text-white' : card.upcoming ? 'bg-white/80 dark:bg-dark/[0.25]' : 'bg-white dark:bg-dark/[0.4]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`text-[40px] ${index === 2 ? 'text-white' : 'text-primary dark:text-white'}`}>{card.icon}</div>
                {card.upcoming ? (
                  <span className="rounded-full border border-dashed border-amber-400/60 bg-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Upcoming
                  </span>
                ) : null}
              </div>
              <BlurReveal preset="slide-up"><h2 className="text-2xl font-semibold">{card.title}</h2></BlurReveal>
              <BlurReveal preset="slide-up"><p className={index === 2 ? 'text-white/80' : 'text-gray-500 dark:text-gray-300'}>{card.text}</p></BlurReveal>
              <div className="mt-auto flex items-end pt-4">
                <div className={`rounded-full border p-3 ${index === 2 ? 'border-white/50' : card.upcoming ? 'border-amber-400/40' : 'border-gray-500/20'}`}>
                  <ArrowRightUp size={18} opacity={0.7} />
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </section>
    </main>
  );
}

export default FeaturesPage;