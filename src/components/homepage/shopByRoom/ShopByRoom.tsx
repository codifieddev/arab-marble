"use client";

import React, { useMemo } from "react";
import { defaultShopByRoomData } from "./shopByRoomData";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";
import { getEntityUrl } from "@/lib/permalink/url-helper";

interface ShopByRoomProps {
  section?: any;
}

const ShopByRoom = ({ section: propSection }: ShopByRoomProps) => {
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
    return currentPages.content?.find((page: any) => page?.adminTitle === "Shop By Room Section");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || defaultShopByRoomData.props;
  const items = (section as any)?.content || defaultShopByRoomData.content;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const buttonLabel = getV(p.buttonLabel);
  const buttonLink = p.buttonLink?.value || p.buttonLink || "/shop";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-shop-by-room-section"
      className="md:pt-[80px] md:pb-[120px] md:px-[5%] py-[50px] px-[5%]  pt-0"
      id="shop-room"
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight">
            <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
          </h2>
        </div>
        <Link
          href={buttonLink}
          className="bg-primary text-white px-8 h-11 rounded-full text-[14px] font-semibold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center md:flex hidden "
        >
          <EditableText value={buttonLabel} isEditable={isEditable} onSave={handle('props.buttonLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item: any, idx: number) => {
          const sp = item.props || {};
          const name = getV(sp.name) || getV(item.name) || getV(item.title) || "";
          const id = item.id || idx;
          const slug = item.slug || sp.slug || (typeof item.id === "string" ? item.id : String(id));
          const categoryUrl = getEntityUrl({ type: "category", slug, id: item.id }, lang);
          const img = sp.image?.value || sp.image || item.img || item.image || "";
          const exploreLabel = getV(p.exploreLabel);

          return (
            <Link
              key={id}
              href={categoryUrl}
              className="bg-surface border border-border rounded-lg overflow-hidden cursor-pointer shadow-lg hover:-translate-y-2 hover:shadow-2xl hover:border-secondary/55 transition-all duration-180 group block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="h-[220px] overflow-hidden bg-muted/10">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                  />
                </div>
                <div className="p-[18px_18px_20px] flex justify-between items-end gap-3">
                  <div>
                    <h4 className="text-[26px] font-bold leading-tight">
                      <EditableText value={name} isEditable={isEditable} onSave={handle(`content.${idx}.props.name.en`)} tag="span" />
                    </h4>
                    <small className="text-muted font-black tracking-[2px] uppercase text-[11px] block mt-1">
                      <EditableText value={exploreLabel} isEditable={isEditable} onSave={handle('props.exploreLabel.en')} tag="span" />
                    </small>
                  </div>
                  <ArrowRight className="text-secondary" size={18} />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ShopByRoom;
