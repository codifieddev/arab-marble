"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { defaultFAQs } from "./faqData";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface FAQProps {
  section?: any;
}

const FAQ = ({ section: propSection }: FAQProps) => {
  const dispatch = useAppDispatch();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const isEditable = useAppSelector((state) => state.pages.isEditable);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find((page: any) => page?.adminTitle === "Homepage FAQs");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const heading = getV(p.heading) || "Frequently Asked Questions";
  const subheading = getV(p.subheading) || "";
  const viewAllLabel = getV(p.viewAllLabel) || "View All FAQs";
  const viewAllLink = p.viewAllLink?.value || p.viewAllLink || "/faq";

  const items = (section as any)?.content || defaultFAQs;

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-faq-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex flex-col items-center text-center mb-[60px]">
        <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight mb-4">
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
        </h2>
        {subheading && <p className="text-muted max-w-2xl mb-6"><EditableText value={subheading} isEditable={isEditable} onSave={handle('props.subheading.en')} tag="span" /></p>}
        <Link
          href={viewAllLink}
          className="text-secondary font-black tracking-[2px] uppercase text-xs border-b border-secondary pb-1"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto">
        {items.map((faq: any, idx: number) => {
          const fp = faq.props || {};
          const title = getV(fp.title) || getV(faq.title) || "";
          const description = getV(fp.description) || getV(faq.description) || "";

          return (
            <div
              key={idx}
              className="border-b border-border py-[22px] cursor-pointer"
              onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
            >
              <div className="flex justify-between items-center gap-3.5">
                <h4 className="font-heading text-[20px] font-bold">
                  <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
                </h4>
                {activeIndex === idx ? (
                  <Minus className="text-secondary" size={22} />
                ) : (
                  <Plus className="text-secondary" size={22} />
                )}
              </div>
              <motion.div
                initial={false}
                animate={{
                  height: activeIndex === idx ? "auto" : 0,
                  marginTop: activeIndex === idx ? 12 : 0,
                }}
                className="overflow-hidden text-muted text-[15px] font-semibold"
              >
                <EditableText value={description} isEditable={isEditable} onSave={handle(`content.${idx}.props.description.en`)} tag="div" />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
