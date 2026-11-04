"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultTestimonialsData } from "./testimonialsData";

interface TestimonialsProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const Testimonials: React.FC<TestimonialsProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultTestimonialsData.props;
  const content = section?.content || defaultTestimonialsData.content;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);

  return (
    <section className="py-24 bg-surface">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
            className="font-heading text-4xl md:text-5xl lg:text-[56px] font-bold text-foreground mb-6"
          >
            {title}
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {content.map((item: any, idx: number) => {
            const p = item.props;
            const name = getV(p.name, lang);
            const role = getV(p.role, lang);
            const quote = getV(p.quote, lang);
            const rating = p.rating?.value || p.rating || 5;

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="rounded-[24px] border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md relative"
              >
                <Quote className="absolute top-8 right-8 text-border/60" size={48} strokeWidth={1} />
                
                <div className="flex items-center gap-1 mb-6 relative z-10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < rating ? "text-secondary fill-secondary" : "text-border fill-border"} 
                    />
                  ))}
                </div>

                <p className="text-foreground/80 leading-relaxed mb-8 relative z-10 font-medium">
                  "{quote}"
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center font-heading font-bold text-xl text-foreground">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{name}</h4>
                    <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">{role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
