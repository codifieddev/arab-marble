"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultDesignPhilosophyData } from "./designPhilosophyData";

const DesignPhilosophy = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "Design Philosophy");
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

  const p = currentSection?.props || defaultDesignPhilosophyData.props;
  const items = currentSection?.content || defaultDesignPhilosophyData.content;

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const paragraphs = getL(p.paragraphs);
  const tags = getL(p.tags);

  return (
    <section
      data-annotate-id="about-materials-section"
      className="bg-[#f7f4ef] text-[#1a1a1a]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-[5%] py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {items.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className={`overflow-hidden rounded-[32px] border border-[#e4ddd3] shadow-xl ${
                idx === 0 ? "sm:translate-y-12" : ""
              }`}
            >
              <img
                src={getV(item.props?.image) || item.image}
                alt={getV(item.props?.alt) || item.alt || ""}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="mb-4 text-[12px] font-black uppercase tracking-[3px] text-secondary">
            {badge}
          </p>
          <h2 className="font-heading text-[34px] font-bold leading-tight tracking-tight text-[#1a1a1a] sm:text-[42px] lg:text-[48px]">
            {heading}
          </h2>
          
          <div className="mt-8 space-y-6">
            {paragraphs?.map((para: any, idx: number) => (
              <p
                key={idx}
                className="text-[16px] font-medium leading-8 text-[#5a5550] sm:text-[17px]"
              >
                {getV(para)}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {tags?.map((tag: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex rounded-full border border-[#ddd5ca] bg-white px-5 py-2.5 text-[13px] font-bold text-[#4c443d] transition-colors hover:border-secondary/30 hover:bg-secondary/5"
              >
                {getV(tag)}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DesignPhilosophy;
