"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { Truck, ShieldCheck, RefreshCcw, Ruler, ArrowRight } from "lucide-react";
import { defaultWhyChooseUsData } from "./whyChooseUsData";

const iconMap: any = {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Ruler,
};

const WhyChooseUs = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return section || currentPages?.content?.find((s: any) => s?.adminTitle === "Why Choose Us");
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val)) return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultWhyChooseUsData.props;
  const items = currentSection?.content || defaultWhyChooseUsData.content;

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const ctaBadge = getV(p.ctaBadge);
  const ctaHeading = getV(p.ctaHeading);
  const ctaDesc = getV(p.ctaDescription);
  const primaryBtn = getV(p.primaryButton);
  const secondaryBtn = getV(p.secondaryButton);

  return (
    <section
      data-annotate-id="about-assurances-section"
      className="bg-[#06130B] text-white"
    >
      <div className="mx-auto max-w-7xl px-[5%] py-24">
        <div className="mb-14 text-center">
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
          {items.map((item: any, idx: number) => {
            const Icon = iconMap[getV(item.props?.icon) || item.icon] || ShieldCheck;
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-[32px] border border-white/5 bg-white/[0.03] p-8 text-center transition-colors hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
                  <Icon className="text-secondary" size={26} />
                </div>
                <h3 className="text-[18px] font-bold tracking-tight text-white">
                  {getV(item.props?.title) || item.title || ""}
                </h3>
                <p className="mt-4 text-[14px] font-medium leading-7 text-white/40">
                  {getV(item.props?.description) || item.desc || ""}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-24 overflow-hidden rounded-[40px] bg-[#0E6233] p-8 sm:p-12 lg:p-16"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-4 text-[12px] font-black uppercase tracking-[3px] text-white/60">
                {ctaBadge}
              </p>
              <h2 className="max-w-3xl font-heading text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[40px] lg:text-[44px]">
                {ctaHeading}
              </h2>
              <p className="mt-6 max-w-2xl text-[16px] font-medium leading-8 text-white/70">
                {ctaDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="/shop"
                className="inline-flex h-12 items-center rounded-full bg-secondary px-8 text-[13px] font-black uppercase tracking-[2px] text-black transition hover:opacity-90"
              >
                {primaryBtn}
              </a>
              <a
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-8 text-[13px] font-black uppercase tracking-[2px] text-white transition hover:bg-white/10"
              >
                {secondaryBtn} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
