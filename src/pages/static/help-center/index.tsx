import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const updates = [
  {
    title: "Task automation preview",
    text: "We're preparing rule-based automation for recurring work, follow-ups, and routine workflows.",
    date: "May 2026",
  },
  {
    title: "Integration roadmap expansion",
    text: "More connected apps are coming so teams can keep work moving without switching tabs.",
    date: "May 2026",
  },
  {
    title: "Performance and polish pass",
    text: "We keep tightening the experience across task creation, navigation, and mobile layouts.",
    date: "May 2026",
  },
];

function HelpCenterPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100">
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.16),_transparent_42%),linear-gradient(180deg,_rgba(246,246,246,0.72),_rgba(246,246,246,0.18))] dark:bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.18),_transparent_42%),linear-gradient(180deg,_rgba(28,28,32,0.96),_rgba(28,28,32,0.76))]" />
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-7rem] h-72 w-72 rounded-full bg-black/5 blur-3xl dark:bg-white/10" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <BlurReveal preset="slide-up" className="inline-flex items-center gap-2 rounded-full border border-gray-500/20 px-6 py-2 font-medium">
            Help center
          </BlurReveal>

          <h1 className="mt-6 max-w-3xl text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
            Find answers, updates, and a direct way to reach us.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-gray-500 dark:text-gray-300 sm:text-lg">
            Use this page to contact the team, check what is new, explore common questions, and read short product notes.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-300">
            <Link to="#contact-form" className="rounded-full border border-gray-500/20 px-4 py-2 hover:text-primary">Contact form</Link>
            <Link to="#whats-new" className="rounded-full border border-gray-500/20 px-4 py-2 hover:text-primary">What&apos;s new</Link>
            <Link to="/faqs" className="rounded-full border border-gray-500/20 px-4 py-2 hover:text-primary">FAQs</Link>
            <Link to="/blog" className="rounded-full border border-gray-500/20 px-4 py-2 hover:text-primary">Blog</Link>
          </div>
        </div>
      </section>

      <section id="contact-form" className="px-6 pb-24 scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Animate preset="zoomIn" duration={2} className="rounded-3xl border border-gray-500/20 bg-white p-8 dark:bg-dark/[0.4]">
            <BlurReveal preset="slide-up"><h2 className="text-2xl font-semibold">Contact form</h2></BlurReveal>
            <BlurReveal preset="slide-up"><p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Send a message and we&apos;ll get back to you as soon as possible.</p></BlurReveal>

            <form className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Name
                  <input className="rounded-xl border border-gray-500/20 bg-transparent px-4 py-3 outline-none focus:border-primary" type="text" name="name" placeholder="Your name" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Email
                  <input className="rounded-xl border border-gray-500/20 bg-transparent px-4 py-3 outline-none focus:border-primary" type="email" name="email" placeholder="you@example.com" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Subject
                <input className="rounded-xl border border-gray-500/20 bg-transparent px-4 py-3 outline-none focus:border-primary" type="text" name="subject" placeholder="How can we help?" />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Message
                <textarea className="min-h-40 rounded-xl border border-gray-500/20 bg-transparent px-4 py-3 outline-none focus:border-primary" name="message" placeholder="Tell us a bit more about the issue..." />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">We usually respond within 1 business day.</p>
                <Button type="submit">Send message</Button>
              </div>
            </form>
          </Animate>

          <Animate preset="zoomIn" duration={2} delay={0.15} className="rounded-3xl border border-gray-500/20 bg-primary p-8 text-white">
            <BlurReveal preset="slide-up"><h2 className="text-2xl font-semibold">Need a quicker answer?</h2></BlurReveal>
            <p className="mt-3 text-white/80">Check the dedicated FAQs and blog pages for deeper help, or use the links to jump to product updates.</p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-white/70">Email</p>
                <p className="mt-1 text-lg font-medium">support@flashtasks.app</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-white/70">Response window</p>
                <p className="mt-1 text-lg font-medium">Monday to Friday</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-white/70">Best for</p>
                <p className="mt-1 text-lg font-medium">Billing, setup, feedback, and partnership requests</p>
              </div>
            </div>
          </Animate>
        </div>
      </section>

      <section id="whats-new" className="px-6 pb-24 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <BlurReveal preset="slide-up"><h2 className="text-3xl font-semibold">What&apos;s new</h2></BlurReveal>
            <BlurReveal preset="slide-up"><p className="mt-2 text-gray-500 dark:text-gray-300">Recent changes, upcoming improvements, and release notes from the team.</p></BlurReveal>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {updates.map((item, index) => (
              <Animate key={item.title} preset="zoomIn" duration={2} delay={index * 0.12} className="rounded-2xl border border-gray-500/20 bg-white p-6 dark:bg-dark/[0.4]">
                <p className="text-sm font-medium text-primary">{item.date}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{item.text}</p>
              </Animate>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HelpCenterPage;