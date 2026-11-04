"use client";
import React, { useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { defaultFeaturedBanner } from "./featuredBannerData";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface FeaturedBannerProps {
  section?: any;
}

const FeaturedBanner = ({ section: propSection }: FeaturedBannerProps) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const isEditable = useAppSelector((state) => state.pages.isEditable);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages || !Array.isArray(currentPages.content)) return;
    return currentPages.content.find((page: any) => page?.adminTitle === "FeaturedBanner");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || defaultFeaturedBanner.props;
  const rawContent = (section as any)?.content || defaultFeaturedBanner.content;
  const content = Array.isArray(rawContent) ? rawContent : [];

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const description = getV(p.description);
  const buttonLabel = getV(p.buttonLabel);
  const buttonLink = p.buttonLink?.value || p.buttonLink || "/shop";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-featured-banner"
      className="bg-primary text-white grid lg:grid-cols-2 items-center overflow-hidden "
      id="bedroom"
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="md:h-[650px] h-[380px]"
      >
        <img
          src="/images/featured-design-objects.png"
          alt=""
          className="w-full h-full object-cover saturate-[1.02] contrast-[1.02]"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-[50px] lg:p-[90px]"
      >
        <span className="text-secondary uppercase text-[12px] tracking-[3px] font-black">
          <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
        </span>
        <h2 className="text-[38px] lg:text-[48px] font-bold leading-tight mt-2">
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
        </h2>
        <p className="text-white/80 font-semibold max-w-[540px] mt-3">
          <EditableText value={description} isEditable={isEditable} onSave={handle('props.description.en')} tag="span" />
        </p>
        {buttonLabel && (
          <Link
            href={buttonLink}
            className="mt-5 px-6 h-11 inline-flex items-center rounded-full border border-white/70 text-white text-[14px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            <EditableText value={buttonLabel} isEditable={isEditable} onSave={handle('props.buttonLabel.en')} tag="span" />
          </Link>
        )}
      </motion.div>
    </section>
  );
};

export default FeaturedBanner;
