import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const announcements = [
  { title: "New onboarding flow", text: "We are refining the first-time experience to make setup faster and clearer.", date: "May 2026" },
  { title: "Upcoming task automation", text: "Rule-based automation is on the way for recurring workflows and follow-ups.", date: "May 2026" },
  { title: "More integrations", text: "We are expanding the list of supported apps for better cross-tool productivity.", date: "May 2026" },
];

function AnnouncementsPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal preset="slide-up" className="inline-flex rounded-full border border-gray-500/20 px-5 py-2 text-sm font-medium">Announcements</BlurReveal>
          <BlurReveal preset="slide-up"><h1 className="mt-6 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">Updates from the Flashtasks team.</h1></BlurReveal>
          <p className="mt-6 text-gray-500 dark:text-gray-300">Track product announcements, roadmap notes, and new feature releases in one place.</p>
          <div className="mt-8 flex justify-center">
            <Button href="/help-center#whats-new">See what&apos;s new</Button>
          </div>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {announcements.map((item, index) => (
            <Animate key={item.title} preset="zoomIn" duration={2} delay={index * 0.1} className="rounded-3xl border border-gray-500/20 bg-white p-6 dark:bg-dark/[0.4]">
              <p className="text-sm font-medium text-primary">{item.date}</p>
              <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{item.text}</p>
            </Animate>
          ))}
        </section>
      </div>
    </main>
  );
}

export default AnnouncementsPage;