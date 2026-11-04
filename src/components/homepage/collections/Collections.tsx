"use client";
import React, { useMemo } from "react";
// import { defaultCollections, defaultCollectionProps } from "./collectionsData";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface CollectionsProps {
  section?: any;
}

const Collections = ({ section: propSection }: CollectionsProps) => {
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
    return currentPages.content?.find(
      (page: any) => page?.adminTitle === "Collections",
    );
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props 
  const items = (section as any)?.content

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const heading = getV(p?.heading);
  const viewAllLabel = getV(p?.viewAllLabel);
  const viewAllLink = p?.viewAllLink?.value || p?.viewAllLink || "/category";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-collections-section"
      className="md:py-[60px] md:px-[5%] py-[50px] px-[5%] "
      id="living"
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight">
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
        </h2>
        <Link
          href={viewAllLink}
          className="px-6 h-11 rounded-full border border-secondary/45 text-foreground text-[14px] font-semibold uppercase tracking-wider hover:bg-secondary/15 transition-all flex items-center"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items?.map((item: any, idx: number) => {
          const sp = item.props || {};
          const title = getV(sp.title) || getV(item.title) || "";
          const image = sp.image?.value || sp.image || item.image || "";
          const link = sp.link?.value || sp.link || item.link || "/shop";

          return (
            <Link
              key={idx}
              href={link}
              className="relative h-[450px] overflow-hidden rounded-md border border-border group cursor-pointer block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="w-full h-full"
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-85 pointer-events-none" />
                <div className="absolute bottom-7 left-7 text-white z-10">
                  <h3 className="text-[26px] font-bold">
                    <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
                  </h3>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Collections;
