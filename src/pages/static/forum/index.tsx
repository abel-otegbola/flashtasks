import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const threads = [
  { title: "Best way to organize recurring tasks?", replies: 14, category: "Productivity" },
  { title: "How are teams using integrations day to day?", replies: 9, category: "Integrations" },
  { title: "What would you like automation to do next?", replies: 22, category: "Roadmap" },
];

function ForumPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal preset="slide-up" className="inline-flex rounded-full border border-gray-500/20 px-5 py-2 text-sm font-medium">Forum</BlurReveal>
          <BlurReveal preset="slide-up"><h1 className="mt-6 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">A place to share workflows, ideas, and feedback.</h1></BlurReveal>
          <p className="mt-6 text-gray-500 dark:text-gray-300">Join the discussion with other users, ask questions, and help shape what comes next.</p>
          <div className="mt-8 flex justify-center">
            <Button href="/help-center#contact-form">Start a conversation</Button>
          </div>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {threads.map((thread, index) => (
            <Animate key={thread.title} preset="zoomIn" duration={2} delay={index * 0.1} className="rounded-3xl border border-gray-500/20 bg-white p-6 dark:bg-dark/[0.4]">
              <p className="text-sm font-medium text-primary">{thread.category}</p>
              <h2 className="mt-3 text-2xl font-semibold">{thread.title}</h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{thread.replies} replies so far</p>
            </Animate>
          ))}
        </section>
      </div>
    </main>
  );
}

export default ForumPage;