"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultFeaturedCollectionsData } from "./featuredCollectionsData";

interface FeaturedCollectionsProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultFeaturedCollectionsData.props;
  const content = section?.content || defaultFeaturedCollectionsData.content;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);
  const description = getV(props.description, lang);

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="text-[10px] font-black uppercase tracking-[2px] text-foreground/80">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl lg:text-[56px] font-bold text-foreground mb-6"
          >
            {title}
          </motion.h2>

          {description && (
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-foreground/70 text-lg leading-relaxed"
            >
              {description}
            </motion.p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {content.map((item: any, idx: number) => {
            const p = item.props;
            const itemTitle = getV(p.title, lang);
            const image = p.image?.value || p.image || "";
            const link = getV(p.link, lang) || "#";

            return (
              <motion.a
                key={item.id || idx}
                href={link}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-[32px] block aspect-[4/3] md:aspect-[16/11]"
              >
                <img 
                  src={image} 
                  alt={itemTitle} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                   <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">{itemTitle}</h3>
                   <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                      <span>Explore Collection</span>
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center transition-colors group-hover:bg-secondary group-hover:text-black backdrop-blur-sm">
                         <ArrowRight size={14} />
                      </div>
                   </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
