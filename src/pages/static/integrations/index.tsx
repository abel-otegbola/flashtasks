import { useMemo } from "react";
import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const platforms = [
  {
    name: "Slack",
    text: "Track conversations, detect follow-ups, and send reminders automatically.",
    status: "Available",
  },
  {
    name: "Gmail",
    text: "Monitor threads, schedule reminders, and draft follow-up replies.",
    status: "Available",
  },
  {
    name: "WhatsApp",
    text: "Planned next. Hermes will support more channels soon.",
    status: "Coming soon",
  },
];

function IntegrationsPage() {
  const cards = useMemo(() => platforms, []);

  return (
    <main className="dark:bg-dark-bg dark:text-gray-100">
      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.16),_transparent_42%),linear-gradient(180deg,_rgba(246,246,246,0.7),_rgba(246,246,246,0.2))] dark:bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.18),_transparent_42%),linear-gradient(180deg,_rgba(28,28,32,0.95),_rgba(28,28,32,0.75))]" />
        <div className="absolute right-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <BlurReveal preset="slide-up" className="inline-flex items-center gap-2 rounded-full border border-gray-500/20 px-6 py-2 font-medium">
            Integrations
          </BlurReveal>

          <h1 className="mt-6 max-w-2xl md:text-[32px] text-[28px] font-medium leading-[120%]">
            Connect the tools your team already uses.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-gray-500 dark:text-gray-300 sm:text-lg">
            Hermes brings Slack, email, and future channels into the same workflow so follow-ups never slip.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/auth/signup">Get started</Button>
            <Button href="/features" variant="secondary">Explore features</Button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {cards.map((platform, index) => (
            <Animate key={platform.name} preset="zoomIn" duration={2} delay={index * 0.15} className="flex flex-col gap-4 rounded-2xl border border-gray-500/20 bg-white p-8 dark:bg-dark/[0.4]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">{platform.name}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${platform.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {platform.status}
                </span>
              </div>
              <BlurReveal preset="slide-up"><p className="text-gray-500 dark:text-gray-300">{platform.text}</p></BlurReveal>
            </Animate>
          ))}
        </div>
      </section>
    </main>
  );
}

export default IntegrationsPage;