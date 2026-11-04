"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultAboutPeekeeperData } from "./aboutPeekeeperData";

const AboutPeekeeper = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "About Peekeeper");
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val)) return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultAboutPeekeeperData.props;
  const items = currentSection?.content || defaultAboutPeekeeperData.content;

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const description = getV(p.description);
  const primaryBtn = getV(p.primaryButton);
  const secondaryBtn = getV(p.secondaryButton);
  const bgImage = getV(p.backgroundImage) || defaultAboutPeekeeperData.props.backgroundImage;

  return (
    <section
      data-annotate-id="about-hero-section"
      className="relative overflow-hidden border-b border-border bg-[#0f1f17] text-white"
    >
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Peekeeper background"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
      </div>

      <div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-[5%] py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-5 text-[12px] font-black uppercase tracking-[4px] text-secondary"
          >
            {badge}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="max-w-[780px] font-heading text-[30px] font-bold leading-[0.95] tracking-tight sm:text-[40px] lg:text-[50px]"
          >
            {heading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="mt-6 max-w-[620px] text-[16px] font-semibold leading-8 text-white/80 sm:text-[18px]"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <a
              href="/shop"
              className="inline-flex h-12 items-center rounded-full bg-secondary px-6 text-[13px] font-black uppercase tracking-[2px] text-black transition hover:opacity-90"
            >
              {primaryBtn}
            </a>
            <a
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-[13px] font-black uppercase tracking-[2px] text-white transition hover:bg-white/10"
            >
              {secondaryBtn}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {items?.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className={`overflow-hidden rounded-[26px] border border-white/10 bg-white/10 backdrop-blur-md ${
                idx === 1 ? "sm:translate-y-10" : ""
              }`}
            >
              <img
                src={getV(item.props?.image) || item.image}
                alt={getV(item.props?.alt) || item.alt || "Peekeeper interior"}
                className="h-[240px] w-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPeekeeper;
