"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { defaultCraftData } from "./craftData";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface CraftProps {
  section?: any;
}

const Craft = ({ section: propSection }: CraftProps) => {
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
    if (!currentPages) return;
    return currentPages.content?.find((page: any) => page?.adminTitle === "Craft & Quality Section");
  }, [currentPages]);

  const section = propSection || getCurrentSection;
  const rawContent = (section as any)?.content || defaultCraftData.content;
  const content = Array.isArray(rawContent) ? rawContent : [];

  const p = (section as any)?.props || defaultCraftData.props;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const title = getV(p.title);
  const buttonLabel = getV(p.buttonLabel);
  const buttonLink = p.buttonLink?.value || p.buttonLink || "/about";
  const mainHeading = getV(p.mainHeading);
  const description = getV(p.description);

  const imgBlock = content.find((b: any) => b.type === "image");
  const listBlock = content.find((b: any) => b.type === "list");
  const buttonsBlock = content.find((b: any) => b.type === "buttons");

  const listItems = listBlock?.items || listBlock?.props?.items?.value || [];
  const buttons = buttonsBlock?.items || buttonsBlock?.props?.items?.value || [];

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-craft-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%]  bg-surface/50 border-y border-border"
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight">
            <EditableText value={title} isEditable={isEditable} onSave={handle('props.title.en')} tag="span" />
          </h2>
        </div>
        <Link
          href={buttonLink}
          className="px-[18px] h-11 rounded-full bg-secondary/18 text-dark border border-secondary/35 text-[14px] font-semibold uppercase tracking-wider hover:bg-secondary/26 hover:border-secondary/55 transition-all flex items-center md:flex hidden"
        >
          <EditableText value={buttonLabel} isEditable={isEditable} onSave={handle('props.buttonLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="h-[520px] rounded-lg overflow-hidden bg-muted/10 border border-border "
        >
          <img
            src={imgBlock?.url || "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=1600"}
            alt={imgBlock?.alt || "Materials"}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-background/70 border border-border p-[34px] rounded-lg shadow-sm"
        >
          <h3 className="font-heading md:text-[42px] text-[28px] font-extrabold leading-none">
            <EditableText value={mainHeading} isEditable={isEditable} onSave={handle('props.mainHeading.en')} tag="span" />
          </h3>
          <p className="text-muted font-semibold mt-2.5">
            <EditableText value={description} isEditable={isEditable} onSave={handle('props.description.en')} tag="span" />
          </p>

          <div className="grid gap-3 mt-[18px]">
            {listItems.map((li: any, idx: number) => {
              const text = getV(li);
              return (
                <div
                  key={idx}
                  className="flex gap-2.5 items-start font-bold text-foreground/85"
                >
                  <CheckCircle2 className="text-secondary mt-0.5" size={18} />
                  <EditableText value={text} isEditable={isEditable} onSave={handle(`content.${content.indexOf(listBlock)}.items.${idx}.en`)} tag="span" />
                </div>
              );
            })}
          </div>

          <div className="mt-[22px] flex gap-3 flex-wrap">
            {buttons.map((btn: any, i: number) => {
              const label = getV(btn.label);
              return (
                <Link
                  key={i}
                  href={btn.link || "#"}
                  className={`px-[18px] h-11 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-all flex items-center ${
                    i === 0
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-secondary/45 text-foreground hover:bg-secondary/15"
                  }`}
                >
                  <EditableText value={label} isEditable={isEditable} onSave={handle(`content.${content.indexOf(buttonsBlock)}.items.${i}.label.en`)} tag="span" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Craft;
