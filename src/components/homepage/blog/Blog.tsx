"use client";

import React, { useState, useRef, useMemo } from "react";
import { defaultBlogPosts } from "./blogData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface BlogProps {
  section?: any;
}

const Blog = ({ section: propSection }: BlogProps) => {
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
    return currentPages.content?.find((page: any) => page?.adminTitle === "Latest Blog Posts");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const heading = getV(p.heading) || "The Journal";
  const viewAllLabel = getV(p.viewAllLabel) || "View All Posts";
  const viewAllLink = p.viewAllLink?.value || p.viewAllLink || "/blog";

  const items = (section as any)?.content || defaultBlogPosts;

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
      data-annotate-id="home-blog-section"
      className="md:py-[40px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <h2 className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight">
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')} tag="span" />
        </h2>
        <Link
          href={viewAllLink}
          className="bg-primary text-white px-8 h-11 rounded-full text-[14px] font-semibold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center md:flex hidden"
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
          {items.map((post: any, idx: number) => {
            const pp = post.props || {};
            const title = getV(pp.title) || getV(post.title) || "";
            const description = getV(pp.description) || getV(post.description) || "";
            const image = pp.image?.value || pp.image || post.image || "";
            const link = pp.link?.value || pp.link || post.link || "#";

            return (
              <div
                key={idx}
                className="min-w-[calc(100%-24px)] md:min-w-[calc((100%-48px)/3)] snap-start group"
              >
                <Link href={link} className="block">
                  <div className="relative h-[480px] mb-6 overflow-hidden rounded-lg border border-border bg-muted/10">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-[11px] text-secondary tracking-[2px] uppercase font-black">
                    <EditableText value={description} isEditable={isEditable} onSave={handle(`content.${idx}.props.description.en`)} tag="span" />
                  </span>
                  <h4 className="font-heading text-[26px] mt-2.5 mb-3 leading-tight font-bold">
                    <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
                  </h4>
                  <div
                    className="inline-block mt-3 text-[12px] font-black tracking-wider uppercase border-b border-secondary hover:text-secondary transition-colors"
                  >
                    Read More
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

export default Blog;
