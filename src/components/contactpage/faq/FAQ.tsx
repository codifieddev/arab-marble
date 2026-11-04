"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { defaultFaqData } from './faqData';
import { useAppSelector } from "@/lib/store/hooks";
import { usePathname } from "next/navigation";
import EditableText from "@/components/shared/EditableText";

interface FAQProps {
  data?: any;
}

export const FAQ: React.FC<FAQProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { currentPages } = useAppSelector((state) => state.pages);
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const faqSection = useMemo(() => {
    return currentPages?.content?.find((s: any) => s.adminTitle === "Contact FAQ");
  }, [currentPages]);

  const content = faqSection?.props || data || defaultFaqData.props;

  const getLocalizedValue = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.en || "";
    }
    return val;
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-32 px-[5%] bg-surface/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-secondary uppercase tracking-[4px] text-sm font-black mb-4">
            <EditableText
              value={getLocalizedValue(content.label)}
              currentPages={currentPages}
              sectionId={faqSection?.id}
              fieldPath="props.label"
            />
          </p>
          <h2 className="text-[42px] font-bold tracking-tight">
            <EditableText
              value={getLocalizedValue(content.heading)}
              currentPages={currentPages}
              sectionId={faqSection?.id}
              fieldPath="props.heading"
            />
          </h2>
        </div>

        <div className="space-y-6">
          {content.questions?.map((faq: any, idx: number) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div 
                key={idx} 
                className={`bg-background border p-8 rounded-3xl transition-all cursor-pointer group ${
                  isExpanded ? 'border-secondary' : 'border-border hover:border-secondary/50'
                }`}
                onClick={() => toggleAccordion(idx)}
              >
                <h4 className="text-xl font-bold flex items-center justify-between gap-4">
                  <span onClick={(e) => e.stopPropagation()}>
                    <EditableText
                      value={getLocalizedValue(faq.q)}
                      currentPages={currentPages}
                      sectionId={faqSection?.id}
                      fieldPath={`props.questions.${idx}.q`}
                    />
                  </span>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'text-secondary rotate-180' : 'text-muted group-hover:text-secondary'
                  }`}>
                    {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </h4>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted font-semibold leading-relaxed pt-4" onClick={(e) => e.stopPropagation()}>
                        <EditableText
                          value={getLocalizedValue(faq.a)}
                          currentPages={currentPages}
                          sectionId={faqSection?.id}
                          fieldPath={`props.questions.${idx}.a`}
                          tag="p"
                        />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
