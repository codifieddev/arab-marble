"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultCtaBannerData } from "./ctaBannerData";

interface CtaBannerProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const CtaBanner: React.FC<CtaBannerProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultCtaBannerData.props;

  const title = getV(props.title, lang);
  const description = getV(props.description, lang);
  const primaryCTA = getV(props.primaryCTA, lang);
  const primaryLink = getV(props.primaryLink, lang) || "#";
  const image = props.image?.value || props.image || defaultCtaBannerData.props.image;

  return (
    <section className="py-12 lg:py-24 bg-surface">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[32px] md:rounded-[48px] aspect-[4/5] md:aspect-[21/9]"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={image} 
              alt={title} 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center p-8 md:p-16 lg:p-24">
             <div className="max-w-[540px]">
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.05]">
                  {title}
                </h2>
                <p className="text-white/80 text-lg mb-10 leading-relaxed font-sans">
                  {description}
                </p>
                <a
                  href={primaryLink}
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-secondary px-8 font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
                >
                  {primaryCTA}
                  <ArrowRight size={18} />
                </a>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaBanner;
