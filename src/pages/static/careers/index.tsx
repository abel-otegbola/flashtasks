import Button from "../../../components/button/button";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const openings = [
  { role: "Frontend Engineer", type: "Remote", focus: "Design systems, React, and performance" },
  { role: "Product Designer", type: "Remote", focus: "Product flows, interactions, and visual craft" },
  { role: "Customer Success", type: "Hybrid", focus: "Onboarding, support, and user feedback loops" },
];

function CareersPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal preset="slide-up" className="inline-flex rounded-full border border-gray-500/20 px-5 py-2 text-sm font-medium">Careers</BlurReveal>
          <BlurReveal preset="slide-up"><h1 className="mt-6 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">Help shape the future of calm, fast productivity.</h1></BlurReveal>
          <p className="mt-6 text-gray-500 dark:text-gray-300">We care about thoughtful systems, strong execution, and a product experience that feels light even when the work is serious.</p>
          <div className="mt-8 flex justify-center">
            <Button href="/help-center">Contact us</Button>
          </div>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {openings.map((opening, index) => (
            <Animate key={opening.role} preset="zoomIn" duration={2} delay={index * 0.1} className="rounded-3xl border border-gray-500/20 bg-white p-6 dark:bg-dark/[0.4]">
              <p className="text-sm font-medium text-primary">{opening.type}</p>
              <h2 className="mt-3 text-2xl font-semibold">{opening.role}</h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{opening.focus}</p>
              <div className="mt-6">
                <Button variant="secondary" href="/help-center#contact-form" className="w-full justify-center">Ask about this role</Button>
              </div>
            </Animate>
          ))}
        </section>
      </div>
    </main>
  );
}

export default CareersPage;