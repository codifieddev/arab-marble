"use client";
import { useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import MainHeroSlider from "./MainHeroSlider";

const Hero = ({ section: propSection }: { section?: any }) => {
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const section = useMemo(() => {
    if (propSection) return propSection;
    if (!currentPages) return null;
    return currentPages.content?.find(
      (page: any) => page.adminTitle === "Premium Hero Slider" || page.adminTitle === "Hero"
    );
  }, [propSection, currentPages]);

  return (
    <section data-annotate-id="home-hero-section">
      <MainHeroSlider initialSlides={section?.content} />
    </section>
  );
};

export default Hero;
