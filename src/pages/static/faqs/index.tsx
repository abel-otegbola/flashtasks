import { useState } from "react";
import { FAQ_ITEMS } from "../../../data/faqs";
import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

function FaqsPage() {
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0]?.id ?? "");

  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <BlurReveal preset="slide-up"><h1 className="text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">FAQs</h1></BlurReveal>
          <BlurReveal preset="slide-up"><p className="mt-4 text-gray-500 dark:text-gray-300">Quick answers to the most common questions about Flashtasks.</p></BlurReveal>
        </div>

        <div className="grid gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqId === item.id;

            return (
              <Animate key={item.id} preset="scaleUp" duration={2} delay={index * 0.06}>
                <article className="rounded-2xl border border-gray-500/20 bg-white p-5 dark:bg-dark/[0.4]">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? "" : item.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base font-medium">{item.question}</span>
                    <span className="text-sm text-primary">{isOpen ? "Close" : "Open"}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "mt-4 max-h-40" : "max-h-0"}`}>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-300">{item.answer}</p>
                  </div>
                </article>
              </Animate>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default FaqsPage;