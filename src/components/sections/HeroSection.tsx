"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const autoplayTime = 5000;

interface HeroSectionProps {
  heroSection: any;
  showToast?: (msg: string) => void;
}

export default function HeroSection({
  heroSection,
  showToast,
}: HeroSectionProps) {
  const { locale } = useParams();
  const currentLocale = (locale as string) || "en";
  const carousel = heroSection?.columns[0]?.find(
    (section: any) => section.type === "carousel",
  );

  // Transform carousel data into slides format
  const slides =
    carousel?.items?.map((item: any) => {
      const column = item.columns?.[0] || [];

      const heading = column.find((block: any) => block.type === "heading");
      const paragraph = column.find((block: any) => block.type === "paragraph");
      const buttonBlock = column.find((block: any) => block.type === "button");
      const buttons = buttonBlock?.buttons || [];

      return {
        id: item.id,
        title: heading?.text?.[currentLocale] || heading?.text?.en || "",
        description:
          paragraph?.text?.[currentLocale] || paragraph?.text?.en || "",
        buttons: buttons.map((btn: any) => ({
          id: btn.id,
          label: btn.label?.[currentLocale] || btn.label?.en || "",
          link: btn.link || "#",
          actionType: btn.actionType || "link",
        })),
        image: item.image || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
      };
    }) || [];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, autoplayTime);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[420px] sm:h-[500px] md:h-[580px] lg:h-[640px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={slides[activeSlide].image}
              alt={slides[activeSlide].title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl text-white"
                >
                  <h1 className="text-4xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
                    {slides[activeSlide].title}
                  </h1>

                  <p className="mt-4 text-sm leading-6 text-white/85 sm:text-base md:text-lg">
                    {slides[activeSlide].description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                    {slides[activeSlide].buttons.map((button: any) => (
                      <Link
                        key={button.id}
                        href={button.link}
                        className={cn(
                          "inline-flex items-center justify-center rounded-xl px-8 py-4 text-md font-bold transition-all duration-300",
                          button.id === slides[activeSlide].buttons[0]?.id
                            ? "bg-[#0d6533] text-white hover:bg-[#0d6533]/90 hover:shadow-lg hover:shadow-[#0d6533]/30"
                            : "bg-transparent border border-white text-white hover:bg-white/10",
                        )}
                      >
                        {button.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 border border-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 border border-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                activeSlide === index
                  ? "bg-white w-10"
                  : "bg-white/40 hover:bg-white/60 w-3",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
