"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultHeroSectionData } from "./heroSectionData";

interface HeroSectionProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultHeroSectionData.props;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);
  const description = getV(props.description, lang);
  const primaryCTA = getV(props.primaryCTA, lang);
  const primaryLink = getV(props.primaryLink, lang) || "/";
  const image = props.image?.value || props.image || defaultHeroSectionData.props.image;

  // Split title for editorial styling (highlighting the last word if multiple words exist)
  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const restOfTitle = words.join(" ");

  return (
    <section className="relative min-h-[calc(100vh-106px)] flex items-center overflow-hidden bg-background">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] as any }}
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        {/* Gradients for text readability & premium feel */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-[1440px] px-[5%] py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }}
            className="max-w-[640px]"
          >
            {badge && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span className="text-[10px] font-black uppercase tracking-[2px] text-white/90">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="font-heading text-5xl sm:text-6xl md:text-[76px] font-bold text-white leading-[0.95] tracking-tight mb-6">
              {restOfTitle} {lastWord && <span className="text-secondary italic font-medium">{lastWord}</span>}
              {!lastWord && title}
            </h1>

            <p className="text-white/80 max-w-md mb-10 text-lg leading-relaxed font-sans">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={primaryLink}
                className="inline-flex h-14 items-center justify-center rounded-full bg-secondary px-8 text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
              >
                {primaryCTA}
              </a>
              <a
                href="#categories"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50"
              >
                <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>

          {/* Floating Aesthetic Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as any }}
            className="hidden lg:flex justify-end"
          >
            <div className="relative w-full max-w-[340px] rounded-[24px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
               <div className="mb-5 aspect-[4/3] w-full overflow-hidden rounded-[16px]">
                  <img 
                    src="https://images.unsplash.com/photo-1595514535315-2a29094cefb0?auto=format&fit=crop&q=80&w=600" 
                    alt="Featured" 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Featured Design</p>
                   <p className="font-heading text-2xl font-bold text-white">The Artisan Chair</p>
                 </div>
                 <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center transition-colors hover:bg-secondary group cursor-pointer">
                    <ArrowRight size={18} className="text-white group-hover:text-black transition-colors" />
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
