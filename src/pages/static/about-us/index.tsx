import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const stats = [
  { value: "500+", label: "teams supported" },
  { value: "10+", label: "hours saved weekly" },
  { value: "24/7", label: "task visibility" },
];

function AboutUsPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-gray-500/20 bg-white p-8 md:p-12 dark:bg-dark/[0.4]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.14),_transparent_45%)]" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <BlurReveal preset="slide-up" className="inline-flex rounded-full border border-gray-500/20 px-5 py-2 text-sm font-medium">
              About us
            </BlurReveal>
            <BlurReveal preset="slide-up"><h1 className="mt-6 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">We build focused tools for people who want to move faster.</h1></BlurReveal>
            <p className="mt-6 max-w-2xl text-gray-500 dark:text-gray-300">Flashtasks started with a simple idea: task management should reduce friction, not create it. We build for clarity, collaboration, and momentum.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/help-center">Get support</Button>
              <Button href="/careers" variant="secondary">Join the team</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {stats.map((stat, index) => (
              <Animate key={stat.label} preset="zoomIn" duration={2} delay={index * 0.1} className="rounded-3xl border border-gray-500/20 bg-gray-50 p-6 dark:bg-dark-bg">
                <p className="text-4xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{stat.label}</p>
              </Animate>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutUsPage;