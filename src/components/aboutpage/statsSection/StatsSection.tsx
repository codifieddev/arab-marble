"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultStatsSectionData } from "./statsSectionData";

const StatsSection = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "Stats Section");
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val)) return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultStatsSectionData.props;
  const items = currentSection?.content || defaultStatsSectionData.content;

  const sectionPadding = getV(p.sectionPadding) || defaultStatsSectionData.props.sectionPadding;

  return (
    <section 
      data-annotate-id="stats-section"
      className={`bg-white ${sectionPadding} px-[5%]`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center py-10 px-6 rounded-[24px] border border-gray-100 bg-white transition-all hover:shadow-lg hover:shadow-gray-100/50"
            >
              <span className="text-4xl md:text-5xl font-bold text-black mb-3 font-heading">
                {getV(item.props?.value) || item.value}
              </span>
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[2px] text-gray-500 text-center">
                {getV(item.props?.label) || item.label || ""}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
