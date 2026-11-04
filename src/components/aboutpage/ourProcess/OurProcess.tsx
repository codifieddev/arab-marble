"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultOurProcessData } from "./ourProcessData";

const OurProcess = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "Our Process");
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val)) return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultOurProcessData.props;
  const items = currentSection?.content || defaultOurProcessData.content;

  const badge = getV(p.badge);
  const heading = getV(p.heading);

  return (
    <section
      data-annotate-id="about-process-section"
      className="bg-[#06130B] text-white"
    >
      <div className="mx-auto max-w-7xl px-[5%] py-24">
        <div className="mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-[12px] font-black uppercase tracking-[3px] text-secondary"
          >
            {badge}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-[36px] font-bold tracking-tight sm:text-[42px] lg:text-[48px]"
          >
            {heading}
          </motion.h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item: any, idx: number) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-[32px] border border-white/5 bg-white/[0.03] p-8 transition-colors hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div className="text-[12px] font-black uppercase tracking-[3px] text-secondary">
                Step {getV(item.props?.step) || item.step}
              </div>
              <h3 className="mt-6 text-[22px] font-bold tracking-tight text-white">
                {getV(item.props?.title) || item.title || ""}
              </h3>
              <p className="mt-4 text-[14px] font-medium leading-7 text-white/50">
                {getV(item.props?.description) || item.desc || ""}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
