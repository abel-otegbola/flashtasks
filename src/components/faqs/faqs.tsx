'use client';
import { useState } from "react";
import { AltArrowDown } from "@solar-icons/react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "../../data/faqs";
import BlurReveal from "../animations/blurReveal";

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  sectionClassName?: string;
}

function FaqSection({
  title = "Frequently asked questions",
  subtitle = "These are the most commonly asked questions about Flashtasks. Can't find what you are looking for?",
  sectionClassName = "pb-20 mt-20",
}: FaqSectionProps) {

  const [openItemId, setOpenItemId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section className={`px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto ${sectionClassName}`}>
      <div className="rounded-3xl bg-background px-4 sm:px-8 py-10 sm:py-12">
        <div className="text-center max-w-2xl mx-auto">
          <BlurReveal preset="slide-right" duration={3}><h2 className="xl:text-4xl sm:text-3xl text-2xl font-semibold">{title}</h2></BlurReveal>
          <BlurReveal preset="slide-right" duration={3}>
            <p className="mt-3 text-sm sm:text-base opacity-[0.75] leading-6">
              {subtitle} {" "}
            <Link to="/contact" className="underline underline-offset-2 hover:text-primary transition-colors">
              Chat to our friendly team
            </Link>
            .
            </p>
          </BlurReveal>
        </div>

        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openItemId === item.id;

            return (
              <article key={item.id} className="rounded-2xl border border-gray-500/[0.2] bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenItemId(isOpen ? null : item.id)}
                  className="w-full px-4 sm:px-5 py-4 flex items-center gap-3 text-left"
                >
                    <BlurReveal preset="slide-right" duration={3} className="w-8 h-8 rounded-lg border border-gray-500/[0.2] flex items-center justify-center text-xs font-medium opacity-[0.7] shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </BlurReveal>

                    <BlurReveal preset="slide-right" duration={3} className="flex-1 font-medium text-sm sm:text-base">
                      {item.question}
                    </BlurReveal>

                  <span
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                    aria-hidden="true"
                  >
                    <AltArrowDown size={16} />
                  </span>
                </button>

                {isOpen ? (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-[58px] text-sm sm:text-[15px] opacity-[0.72] leading-6">
                    <BlurReveal preset="slide-right" duration={3}>{item.answer}</BlurReveal>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
