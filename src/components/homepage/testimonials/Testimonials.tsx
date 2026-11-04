"use client";

import React, { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { defaultTestimonials, defaultTestimonialProps } from "./testimonialsData";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";
import { ReferenceEditButton } from "@/components/cms/reference-editor";

interface TestimonialsProps {
  section?: any;
}

const Testimonials = ({ section: propSection }: TestimonialsProps) => {
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
    if (!currentPages) return;
    return currentPages.content?.find((page: any) => page?.adminTitle === "Customer Testimonials");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || defaultTestimonialProps;
  const items = (section as any)?.content || defaultTestimonials;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);

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
      data-annotate-id="home-testimonials-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%]  bg-surface/55"
    >
      <div className="flex justify-center text-center mb-[60px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight flex items-center justify-center gap-3">
            <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
            <ReferenceEditButton
              type="testimonial"
              title="Edit Testimonial Reference"
              data={{ ...items[0], author: getV(items[0]?.props?.author || items[0]?.author), role: getV(items[0]?.props?.role || items[0]?.role), quote: getV(items[0]?.props?.quote || items[0]?.quote) }}
              sectionId={section?.id || 'Customer Testimonials'}
              itemIndex={0}
              label="Edit Testimonials"
            />
          </h2>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-1"
        >
          {items.map((item: any, idx: number) => {
            const sp = item.props || {};
            const quote = getV(sp.quote) || getV(item.quote) || "";
            const author = getV(sp.author) || getV(item.author) || "";
            const role = getV(sp.role) || getV(item.role) || "";

            return (
              <div
                key={idx}
                className="min-w-[calc(100%-24px)] md:min-w-[calc((100%-48px)/3)] snap-start h-full"
              >
                <div className="p-9 text-center bg-surface/75 border border-border rounded-lg h-full relative group">
                  <ReferenceEditButton
                    type="testimonial"
                    title={`Edit Testimonial: ${author || 'Customer'}`}
                    data={{ ...item, author, role, quote }}
                    sectionId={section?.id || 'Customer Testimonials'}
                    itemIndex={idx}
                    className="absolute top-3 right-3"
                    compact
                  />
                  <p className="font-heading text-[22px] italic mb-[22px] leading-[1.4] font-semibold text-foreground/90">
                    <EditableText value={quote} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.quote.en`)} tag="span" />
                  </p>
                  <div className="uppercase text-[11px] tracking-[3px] font-black text-foreground/70">
                    &mdash; <EditableText value={author} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.author.en`)} tag="span" />
                    {role ? `, ` : ""}
                    <EditableText value={role} isEditable={false} isReferenced={true} onSave={handle(`content.${idx}.props.role.en`)} tag="span" />
                  </div>
                </div>
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
            {Array.from({ length: items.length }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-160 ${activePage === i ? "bg-secondary scale-125" : "bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
