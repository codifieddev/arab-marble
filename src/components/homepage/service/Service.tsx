"use client";
import React, { useMemo } from "react";
import { Hammer, Package, PenTool } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
// import { defaultServices, defaultServiceProps } from "./serviceData";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface ServiceProps {
  section?: any;
}

const Services = ({ section: propSection }: ServiceProps) => {
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
    return currentPages.content?.find((page: any) => page?.adminTitle === "Services");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props 
  const cards = (section as any)?.content

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p?.badge);
  const heading = getV(p?.heading);
  const viewAllLabel = getV(p?.viewAllLabel);
  const viewAllLink = p?.viewAllLink?.value || p?.viewAllLink || "/services";

  const iconMap: Record<string, any> = {
    "pen-tool": PenTool,
    "hammer": Hammer,
    "package": Package
  };

  const iconsFallback = [PenTool, Hammer, Package];

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-services-section"
      className="md:py-[60px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight">
            <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
          </h2>
        </motion.div>
        <Link
          href={viewAllLink}
          className="md:px-6 px-2 h-11 rounded-full border border-secondary/45 text-foreground md:text-[14px] text-[12px] font-semibold uppercase tracking-wider hover:bg-secondary/15 transition-all flex items-center md:flex hidden"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-7">
        {cards?.map((item: any, idx: number) => {
          const sp = item.props || {};
          const Icon = iconMap[getV(sp.icon)] || iconsFallback[idx % iconsFallback.length];
          const title = getV(sp.title) || getV(item.title) || "";
          const description = getV(sp.description) || getV(item.description) || "";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-[34px] bg-surface border border-border rounded-lg shadow-lg hover:-translate-y-2.5 hover:border-secondary/55 hover:shadow-2xl transition-all duration-180"
            >
              <Icon className="text-secondary mb-[18px]" size={40} />
              <h4 className="text-[22px] font-bold tracking-tight mb-2">
                <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
              </h4>
              <p className="text-muted font-semibold">
                <EditableText value={description} isEditable={isEditable} onSave={handle(`content.${idx}.props.description.en`)} tag="span" />
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
