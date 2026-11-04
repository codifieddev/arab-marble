"use client";
import { useMemo } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { motion } from 'motion/react';
import EditableText from '@/components/shared/EditableText';

interface Props {
  section?: any;
}

export default function LogoStrip({ section: propSection }: Props) {
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const section = useMemo(() => {
    if (propSection) return propSection;
    if (!currentPages) return null;
    return currentPages.content?.find((s: any) => s?.adminTitle === 'Client Logos');
  }, [propSection, currentPages]);

  if (!section) return null;

  const content = section.content;

  return (
    <div className="overflow-hidden py-10 relative z-10">
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex w-fit animate-marquee hover:[animation-play-state:paused]"
      >
        <div className="flex gap-4 pr-4 md:gap-6 md:pr-6 shrink-0">
          {content.map((item: any) => (
            <div key={item.id} className="flex flex-col items-center justify-center w-[110px] h-[110px] md:w-[130px] md:h-[130px] bg-white rounded-2xl shadow-[0_0_15px_rgba(13,101,51,0.1)] shrink-0 transition-transform duration-300 hover:-translate-y-2 cursor-default">
              <img src={item.props?.icon} alt={item.props?.name?.en} className="w-12 h-12 md:w-14 md:h-14 mb-2 md:mb-3 object-contain" />
              <EditableText value={item.props?.name?.en || ''} sectionId={section.id} fieldPath={`content.${content.indexOf(item)}.props.name.en`} className="text-black font-semibold text-[10px] md:text-[12px] text-center tracking-tight" tag="span" />
            </div>
          ))}
        </div>
        <div className="flex gap-4 pr-4 md:gap-6 md:pr-6 shrink-0">
          {content.map((item: any) => (
            <div key={`dup-${item.id}`} className="flex flex-col items-center justify-center w-[110px] h-[110px] md:w-[130px] md:h-[130px] bg-white rounded-2xl shadow-[0_0_15px_rgba(13,101,51,0.1)] shrink-0 transition-transform duration-300 hover:-translate-y-2 cursor-default">
              <img src={item.props?.icon} alt={item.props?.name?.en} className="w-12 h-12 md:w-14 md:h-14 mb-2 md:mb-3 object-contain" />
              <EditableText 
              value={item.props?.name?.en || ''} 
              sectionId={section.id} 
              fieldPath={`content.${content.indexOf(item)}.props.name.en`} className="text-black font-semibold text-[10px] md:text-[12px] text-center tracking-tight" tag="span" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
