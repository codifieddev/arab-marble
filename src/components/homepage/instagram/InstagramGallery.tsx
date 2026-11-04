"use client";
"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultInstagramData } from "./instagramData";
import InstagramPostEmbed from "./InstagramPostEmbed";
import Script from "next/script";

const isInstagramPostUrl = (url: string) => {
  if (!url) return false;
  return url.includes("instagram.com/p/") || url.includes("instagram.com/reel/");
};

const InstagramGallery = ({ section: propSection }: { section?: any }) => {
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages || !Array.isArray(currentPages.content)) return;
    return currentPages.content.find((page: any) => page?.adminTitle === "Instagram Gallery");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || defaultInstagramData.props;
  const items = (section as any)?.content || defaultInstagramData.content;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const buttonLabel = getV(p.buttonLabel);
  const buttonLink = p.buttonLink?.value || p.buttonLink || "https://www.instagram.com/peekeeper_living/";

  return (
  <section
    data-annotate-id="home-instagram-gallery-section"
    className="md:pt-[120px] md:pb-[60px] md:px-[5%] py-[50px] px-[5%] "
  >
    {/* Native header removed to prevent duplicate titles with Elfsight widget */}

    <div className="w-full pb-6 overflow-hidden relative">
      <style>{`
        /* Hide Elfsight Watermark */
        .elfsight-app-b0e81c20-3865-417a-a832-18e8f52612d8 a[href*="elfsight.com"],
        .elfsight-app-b0e81c20-3865-417a-a832-18e8f52612d8 a[title*="Free"],
        a.eapps-link {
          display: none !important;
        }
      `}</style>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className="elfsight-app-b0e81c20-3865-417a-a832-18e8f52612d8" data-elfsight-app-lazy></div>
    </div>
  </section>
  );
};

export default InstagramGallery;
