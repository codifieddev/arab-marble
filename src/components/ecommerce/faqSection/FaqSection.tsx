"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultFaqSectionData } from "./faqSectionData";

interface FaqSectionProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const FaqSection: React.FC<FaqSectionProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultFaqSectionData.props;
  const content = section?.content || defaultFaqSectionData.content;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-[1000px] px-[5%]">
        <div className="mb-16 text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="text-[10px] font-black uppercase tracking-[2px] text-foreground/80">
                {badge}
              </span>
            </motion.div>
          )}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            {title}
          </motion.h2>
        </div>

        <div className="flex flex-col gap-4">
          {content.map((item: any, idx: number) => {
            const p = item.props;
            const question = getV(p.question, lang);
            const answer = getV(p.answer, lang);
            const isOpen = openIndex === idx;

            return (
              <motion.div 
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-[20px] border transition-colors ${isOpen ? 'border-secondary/50 bg-surface' : 'border-border bg-background'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-bold text-foreground pr-8">{question}</h3>
                  <div className={`shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-colors ${isOpen ? 'border-secondary bg-secondary text-black' : 'border-border text-foreground/50'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-foreground/70 leading-relaxed">
                        {answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
