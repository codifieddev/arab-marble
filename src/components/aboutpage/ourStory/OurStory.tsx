"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { CheckCircle2 } from "lucide-react";
import { defaultOurStoryData } from "./ourStoryData";

const OurStory = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "Our Story");
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val)) return val[lang] || val.en || "";
    return val || "";
  };

  const getL = (field: any) => {
    if (!field) return [];
    const val = field.value !== undefined ? field.value : field;
    if (Array.isArray(val)) return val;
    return [];
  };

  const p = currentSection?.props || defaultOurStoryData.props;
  const items = currentSection?.content || defaultOurStoryData.content;

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const image = getV(p.image) || defaultOurStoryData.props.image;
  const paragraphs = getL(p.paragraphs);

  return (
    <section
      data-annotate-id="about-story-section"
      className="bg-[#06130B] text-white"
    >
      <div className="mx-auto max-w-7xl px-[5%] py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square overflow-hidden rounded-[40px] border border-white/5 shadow-2xl"
          >
            <img
              src={image}
              alt={heading}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-[12px] font-black uppercase tracking-[3px] text-secondary">
              {badge}
            </p>
            <h2 className="max-w-[600px] font-heading text-[34px] font-bold leading-tight tracking-tight sm:text-[42px] lg:text-[48px]">
              {heading}
            </h2>

            <div className="mt-8 space-y-6">
              {paragraphs?.map((para: any, idx: number) => (
                <p
                  key={idx}
                  className="text-[16px] font-medium leading-8 text-white/70 sm:text-[17px]"
                >
                  {getV(para)}
                </p>
              ))}
            </div>

            <div className="mt-10 grid gap-5">
              {items.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-4 group"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 transition-colors group-hover:border-secondary/40">
                    <CheckCircle2 className="text-secondary" size={16} />
                  </div>
                  <span className="text-[15px] font-bold text-white/90">
                    {getV(item.props?.text) || item.text || ""}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
