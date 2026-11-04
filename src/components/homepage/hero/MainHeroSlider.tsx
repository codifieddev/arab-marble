"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";

const premiumHeroSlides = [
  {
    id: 1,
    label: "Modern Living",
    title: "Furniture That",
    highlight: "Defines",
    titleEnd: "Your Space.",
    description:
      "Discover sculptural sofas, refined textures, and timeless furniture pieces crafted to bring warmth, comfort, and luxury into the modern home.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80",
    product: "The Archi Sofa",
    price: "Starting at ₹1,200",
  },
  {
    id: 2,
    label: "Bedroom Luxury",
    title: "Designed For",
    highlight: "Quiet",
    titleEnd: "Comfort.",
    description:
      "Elevate your bedroom with calming palettes, elegant beds, and thoughtfully designed furniture that blends sophistication with everyday ease.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1800",
    product: "The Haven Bed",
    price: "Starting at ₹1,450",
  },
  {
    id: 3,
    label: "Dining Collection",
    title: "Gather Around",
    highlight: "Beautifully",
    titleEnd: "Crafted Tables.",
    description:
      "Create memorable dining moments with statement tables, elegant chairs, and premium finishes tailored for contemporary interiors.",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=1800",
    product: "The Forma Table",
    price: "Starting at ₹980",
  },
];

export const extractTitleParts = (text: string) => {
  if (!text) return { title: "", highlight: "", titleEnd: "" };
  const defaultHighlights = ["Defines", "Quiet", "Beautifully"];
  for (const h of defaultHighlights) {
    if (text.includes(h)) {
      const parts = text.split(h);
      return {
        title: parts[0]?.trim() || "",
        highlight: h,
        titleEnd: parts[1]?.trim() || "",
      };
    }
  }
  const words = text.split(" ");
  if (words.length <= 2) return { title: text, highlight: "", titleEnd: "" };
  const mid = Math.floor(words.length / 2);
  return {
    title: words.slice(0, mid).join(" "),
    highlight: words[mid],
    titleEnd: words.slice(mid + 1).join(" "),
  };
};

const MainHeroSlider = ({ initialSlides }: { initialSlides?: any[] }) => {
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [editableSlides, setEditableSlides] = useState<any[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const { currentPages } = useSelector((state: RootState) => state.pages);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find((page: any) =>page.adminTitle === "Premium Hero Slider");
  }, [currentPages]);

  const slides = useMemo(() => {
    if (getCurrentSection && getCurrentSection.content) {
      return getCurrentSection.content.map((slide: any) => {
        const p = slide.props || {};
        const getV = (field: any) => {
          if (!field) return "";
          const val = field.value !== undefined ? field.value : field;
          if (val && typeof val === "object") return val[lang] || val.en || "";
          return val || "";
        };

        return {
          id: slide.id,
          label: getV(p.label),
          title: getV(p.title),
          highlight: getV(p.highlight),
          titleEnd: getV(p.titleEnd),
          description: getV(p.description),
          image: p.image?.value || p.image || "",
          product: getV(p.product),
          price: getV(p.price),
        };
      });
    }
    return initialSlides || premiumHeroSlides;
  }, [getCurrentSection, initialSlides, lang]);


  console.log("getCurrentSection---",getCurrentSection)
  useEffect(() => {
    setEditableSlides(slides);
  }, [slides]);

  //  console.log(getCurrentSection,"getCurrentSection")



  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds auto-rotate

    return () => clearInterval(interval);
  }, [activeIndex, slides.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goNext = () => {
    if (!slides || slides.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    if (!slides || slides.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  const activeSlide = editableSlides[activeIndex] || slides[activeIndex];

  const startEditing = (field: string, currentValue: string) => {
    if (!isInlineEditEnabled) return;
    setEditingField(field);
    setDraftValue(currentValue || "");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const saveEditing = () => {
    if (editingField === null) return;
    setEditableSlides((prev) =>
      prev.map((slide, index) =>
        index === activeIndex ? { ...slide, [editingField]: draftValue } : slide,
      ),
    );
    setEditingField(null);
    setDraftValue("");
  };

  const EditableField = ({
    field,
    value,
    multiline = false,
    className = "",
    highlight = false,
  }: {
    field: string;
    value: string;
    multiline?: boolean;
    className?: string;
    highlight?: boolean;
  }) => {
    if (!isInlineEditEnabled) {
      return <span className={className}>{value}</span>;
    }

    const isEditing = editingField === field;

    return (
      <div className="group relative inline-flex w-full items-start gap-2">
        {isEditing ? (
          <div className="flex w-full items-start gap-2 rounded-lg border border-secondary/50 bg-black/45 p-2 backdrop-blur-md">
            {multiline ? (
              <textarea
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="min-h-[88px] w-full resize-y rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-secondary"
              />
            ) : (
              <input
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-secondary"
              />
            )}
            <button
              onClick={saveEditing}
              className="mt-1 rounded-full bg-secondary p-1.5 text-black transition hover:scale-105"
              aria-label={`Save ${field}`}
            >
              <Check size={14} />
            </button>
            <button
              onClick={cancelEditing}
              className="mt-1 rounded-full border border-white/20 bg-white/10 p-1.5 text-white transition hover:bg-white/20"
              aria-label={`Cancel ${field}`}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            {highlight ? (
              <span className={className}>{value}</span>
            ) : (
              <span className={className}>{value}</span>
            )}
            <button
              onClick={() => startEditing(field, value)}
              className="mt-1 rounded-full border border-white/20 bg-black/35 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:border-secondary hover:text-secondary"
              aria-label={`Edit ${field}`}
            >
              <Pencil size={12} />
            </button>
          </>
        )}
      </div>
    );
  };

  if (!activeSlide) return null;

  return (
    <section className="relative min-h-[calc(100vh-106px)] overflow-hidden bg-neutral-950">
      <AnimatePresence>
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide.image}
            alt={activeSlide.product}
            className="h-full w-full object-cover"
          />

          {/* luxury overlays */}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* decorative blur */}
      <div className="pointer-events-none absolute left-[-120px] top-[10%] h-[260px] w-[260px] rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-[300px] w-[300px] rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-center px-[5%] text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeSlide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-6">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-white">
                WELCOME
              </span>
            </div>

            <h1 className="w-full max-w-[90%] font-serif text-[44px] font-normal leading-[1.2] text-white sm:text-[56px] lg:text-[72px] xl:text-[84px]">
              {activeSlide.title && <span>{activeSlide.title} </span>}
              {activeSlide.highlight && <span className="italic">{activeSlide.highlight} </span>}
              {activeSlide.titleEnd && <span>{activeSlide.titleEnd}</span>}
            </h1>

            <div className="mt-8 mx-auto w-full max-w-3xl text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-relaxed text-white/90 font-serif">
              {activeSlide.description}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === index
                  ? "bg-white w-8"
                  : "bg-white/40 hover:bg-white/60 w-2.5"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MainHeroSlider;

