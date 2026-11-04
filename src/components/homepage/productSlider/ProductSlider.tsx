"use client";

import React, { useState, useRef, useMemo } from "react";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { defaultProductSliderData } from "./productSliderData";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";
import { getEntityUrl } from "@/lib/permalink/url-helper";
import { isBlockReferenced } from "@/lib/cms/referenceGuard";
import { ReferenceEditButton } from "@/components/cms/reference-editor";

interface ProductSliderProps {
  section?: any;
}

const ProductSlider = ({ section: propSection }: ProductSliderProps) => {
  const dispatch = useAppDispatch();
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    return currentPages.content.find((page: any) => page?.adminTitle === "New Essentials Slider");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || defaultProductSliderData.props;
  const rawContent = (section as any)?.content || defaultProductSliderData.content;
  const featuredProducts = Array.isArray(rawContent) ? rawContent : [];

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const viewAllLabel = getV(p.viewAllLabel);
  const viewAllLink = p.viewAllLink?.value || p.viewAllLink || "/shop";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      setActivePage(Math.round(scrollLeft / clientWidth));
    }
  };

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const child = scrollRef.current.firstElementChild as HTMLElement;
      if (child) {
        const itemWidth = child.offsetWidth;
        const gap = 24;
        scrollRef.current.scrollBy({
          left: dir * (itemWidth + gap),
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section
      data-annotate-id="home-product-slider-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight flex items-center gap-3">
            <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
            <ReferenceEditButton
              type="product"
              title="Edit Featured Products"
              data={featuredProducts[0]}
              sectionId={section?.id || 'New Essentials Slider'}
              itemIndex={0}
              label="Edit Products"
            />
          </h2>
        </div>
        <Link
          href={viewAllLink}
          className="px-6 h-11 rounded-full border border-secondary/45 text-foreground text-[14px] font-semibold uppercase tracking-wider hover:bg-secondary/15 transition-all flex items-center md:flex hidden"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-1"
        >
          {featuredProducts.map((prod: any, idx: number) => {
          const dp = prod.props || {};
          const title = getV(dp.title) || getV(prod.title) || "";
          const price = getV(dp.price) || getV(prod.price) || "";
          const prodBadge = getV(dp.badge) || getV(prod.badge) || "";
          const id = prod.id || idx;
          const productSlug = prod.slug || dp.slug || (typeof prod.id === "string" ? prod.id : String(id));
          const productUrl = getEntityUrl({ type: "product", slug: productSlug, id: prod.id }, lang);
          const img = dp.image?.value || dp.image || prod.img || prod.image || "/assets/Image/Sofa.jpg";

            return (
              <div
                key={id}
                className="min-w-[calc(100%-24px)] md:min-w-[calc((100%-48px)/3)] snap-start group"
              >
                <Link href={productUrl} className="block">
                  <div className="relative h-[380px] mb-4 overflow-hidden rounded-lg border border-border bg-muted/10">
                    <ReferenceEditButton
                      type="product"
                      title={`Edit Product: ${title}`}
                      data={{
                        id: prod.id || prod._id || productSlug,
                        name: title,
                        price: price,
                        image: img,
                        badge: prodBadge,
                      }}
                      sectionId={section?.id || 'New Essentials Slider'}
                      itemIndex={idx}
                      className="absolute top-3.5 right-14"
                    />
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                    />
                    {prodBadge && (
                      <div className="absolute top-3.5 left-3.5 bg-surface/88 backdrop-blur-md border border-border p-[8px_10px] rounded-full text-[10px] font-black tracking-[2px] uppercase text-foreground">
                        <EditableText value={prodBadge} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.badge.en`)} tag="span" />
                      </div>
                    )}
                    <button
                      className="absolute top-3 right-3 w-[42px] h-[42px] rounded-full bg-surface/88 backdrop-blur-md border border-border flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground/75"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Heart size={18} />
                    </button>
                    <button
                      className="absolute bottom-0 w-full p-[15px] bg-foreground/92 text-surface text-[12px] font-black tracking-[2px] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-220"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      ADD TO BAG — <EditableText value={price} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.price.en`)} tag="span" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-heading text-[26px] font-bold leading-tight mb-1.5">
                      <EditableText value={title} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
                    </h4>
                    <div className="flex justify-between items-center gap-2.5">
                      <div className="text-muted text-[14px] font-black">
                        <EditableText value={price} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.price.en`)} tag="span" />
                      </div>
                      <div className="flex gap-1 items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className="text-secondary fill-secondary"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3.5 mt-[22px]">
          <div className="flex gap-2.5">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-2.5 justify-center flex-1">
            {Array.from({ length: Math.ceil(featuredProducts.length / 1) }).map(
              (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-160 ${activePage === i ? "bg-secondary scale-125" : "bg-foreground/20"}`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
