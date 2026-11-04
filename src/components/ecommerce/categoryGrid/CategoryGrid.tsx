"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultCategoryGridData } from "./categoryGridData";

interface CategoryGridProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultCategoryGridData.props;
  const content = section?.content || defaultCategoryGridData.content;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);
  const description = getV(props.description, lang);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] as any 
      } 
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center max-w-2xl mx-auto">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 shadow-sm"
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-[56px] font-bold text-foreground leading-[1.1] tracking-tight mb-6"
          >
            {title}
          </motion.h2>

          {description && (
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-foreground/70 text-lg leading-relaxed max-w-[500px]"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {content.map((item: any, idx: number) => {
            const p = item.props;
            const itemTitle = getV(p.title, lang);
            const count = getV(p.count, lang);
            const image = p.image?.value || p.image || "";
            const link = getV(p.link, lang) || "#";
            
            // To make the grid interesting, the first item might span 2 rows if desired, but 
            // maintaining a uniform premium look is often safer. Let's use standard items with nice aspect ratios.
            // We'll give the first and fourth a slightly taller aspect if they span vertically, but 
            // a square/portrait aspect ratio looks great for furniture.
            const isFeatured = idx === 0 || idx === 3;

            return (
              <motion.a
                key={item.id || idx}
                variants={itemVariants}
                href={link}
                className={`group relative overflow-hidden rounded-[24px] bg-white border border-border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 block ${isFeatured ? "md:row-span-2" : ""}`}
              >
                <div className={`relative w-full overflow-hidden ${isFeatured ? "aspect-[3/4] md:h-full" : "aspect-square"}`}>
                  <img 
                    src={image} 
                    alt={itemTitle} 
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                </div>
                
                {/* Text Content overlaying the image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                   <div>
                      <h3 className="font-heading text-2xl font-bold text-white mb-1 drop-shadow-sm">{itemTitle}</h3>
                      {count && (
                        <p className="text-white/80 text-sm font-medium">{count} Products</p>
                      )}
                   </div>
                   
                   {/* Hover Button */}
                   <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-secondary">
                      <ArrowRight size={18} className="text-white group-hover:text-black transition-colors" />
                   </div>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default CategoryGrid;
