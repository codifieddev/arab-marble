"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultContactHeroData } from "./contactHeroData";
import EditableText from "@/components/shared/EditableText";

const ContactHero = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return (
      section ||
      currentPages?.content?.find((s: any) => s?.adminTitle === "Contact Hero")
    );
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val))
      return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultContactHeroData.props;

  const subtitle = getV(p.subtitle);
  const headingLine1 = getV(p.headingLine1);
  const headingLine2 = getV(p.headingLine2);
  const description = getV(p.description);
  const showroomLabel = getV(p.showroomLabel);
  const showroomLocation = getV(p.showroomLocation);
  const supportLabel = getV(p.supportLabel);
  const supportHours = getV(p.supportHours);
  const badgeLine1 = getV(p.badgeLine1);
  const badgeLine2 = getV(p.badgeLine2);
  const badgeLine3 = getV(p.badgeLine3);
  const bgImage = getV(p.bgImage) || defaultContactHeroData.props.bgImage;
  const mainImage = getV(p.mainImage) || defaultContactHeroData.props.mainImage;

  return (
    <section
      data-annotate-id="contact-hero-section"
      className="relative min-h-[70vh] flex items-center px-[5%] overflow-hidden border-b border-border"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Office"
          className="w-full h-full object-cover opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-secondary uppercase tracking-[6px] text-[11px] font-black mb-6">
              <EditableText
                value={subtitle}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.subtitle"
              />
            </p>
            <h1 className="text-[64px] lg:text-[92px] font-black leading-[0.9] tracking-tighter mb-8">
              <EditableText
                value={headingLine1}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.headingLine1"
              />{" "}
              <br />{" "}
              <span className="text-secondary italic font-serif font-normal">
                <EditableText
                  value={headingLine2}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.headingLine2"
                />
              </span>
            </h1>
            <p className="text-xl text-muted font-semibold max-w-[500px] leading-relaxed">
              <EditableText
                value={description}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.description"
                tag="p"
              />
            </p>

            <div className="mt-12 flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-muted mb-2">
                  <EditableText
                    value={showroomLabel}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.showroomLabel"
                  />
                </span>
                <span className="font-bold text-lg">
                  <EditableText
                    value={showroomLocation}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.showroomLocation"
                  />
                </span>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-muted mb-2">
                  <EditableText
                    value={supportLabel}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.supportLabel"
                  />
                </span>
                <span className="font-bold text-lg">
                  <EditableText
                    value={supportHours}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.supportHours"
                  />
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden border border-border shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src={mainImage}
                alt="Studio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary rounded-full flex flex-col items-center justify-center text-white p-8 text-center leading-tight font-black uppercase tracking-widest text-xs shadow-2xl animate-pulse">
              <EditableText
                value={badgeLine1}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.badgeLine1"
              />
              <EditableText
                value={badgeLine2}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.badgeLine2"
              />
              <EditableText
                value={badgeLine3}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.badgeLine3"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
