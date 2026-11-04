"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Send } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultNewsletterSectionData } from "./newsletterSectionData";

interface NewsletterSectionProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultNewsletterSectionData.props;

  const title = getV(props.title, lang);
  const description = getV(props.description, lang);
  const buttonLabel = getV(props.buttonLabel, lang);

  return (
    <section className="py-24 bg-surface border-t border-border">
      <div className="mx-auto max-w-[800px] px-[5%]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Send className="text-secondary" size={24} />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-foreground/70 text-lg mb-8 max-w-[500px] mx-auto leading-relaxed">{description}</p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-[500px] mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Email address" 
              className="h-14 flex-1 rounded-full border border-border bg-background px-6 text-foreground outline-none focus:border-secondary transition-colors"
              required
            />
            <button 
              type="submit" 
              className="h-14 rounded-full bg-secondary px-8 font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
            >
              {buttonLabel}
            </button>
          </form>
          <p className="text-xs text-foreground/40 mt-4 uppercase tracking-widest">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
