import React from "react";
import Hero from "../homepage/hero/Hero";
import USP from "../homepage/usp/USP";
import Services from "../homepage/service/Service";
import Collections from "../homepage/collections/Collections";
import ShopByRoom from "../homepage/shopByRoom/ShopByRoom";
import FeaturedBanner from "../homepage/featuredBanner/FeaturedBanner";
import ProductSlider from "../homepage/productSlider/ProductSlider";
import Craft from "../homepage/craft/Craft";
import Testimonials from "../homepage/testimonials/Testimonials";
import Blog from "../homepage/blog/Blog";
import Newsletter from "../homepage/newsletter/Newsletter";
import FAQ from "../homepage/faq/FAQ";
import InstagramGallery from "../homepage/instagram/InstagramGallery";
import LogoStrip from "../homepage/logoStrip/LogoStrip";
import { getSection, getV } from "@/lib/cmsUtils";
import Link from "next/link";

// Client-only initializers
import GetAllPages from "./GetAllPages";
import GetAllMenus from "../cms/menus/GetAllMenus";
import GetAllProducts from "@/lib/GetAllDetails/GetAllProducts";
import GetAllForms from "../forms/GetAllForms";
import GetAuthTokenFastApi from "../wesiteDetail/GetAuthTokenFastApi";
import UpdateCurrentPage from "./UpdateCurrentPage";
import { AnnotatorPlugin } from "../annotationPlugin";
import { FormComp } from "../forms/FormComp";
import DynamicPageSections from "../sections/DynamicPageSections";

interface HomePageServerProps {
  data: {
    content: any[];
    [key: string]: any;
  };
  lang: string;
}

const HomePageServer = ({ data, lang }: HomePageServerProps) => {
  const content = Array.isArray(data?.content) ? data.content : [];

  const ctaSection = getSection(content, "CTA");
  const ctaBlock = ctaSection?.content?.[0] || ctaSection?.columns?.[0]?.[0];

  const ctaTitle = getV(ctaBlock?.props?.title, lang) || ctaBlock?.title || "";
  const ctaDescription =
    getV(ctaBlock?.props?.description, lang) || ctaBlock?.description || "";
  const ctaButtonLabel =
    getV(ctaBlock?.props?.buttonLabel, lang) || ctaBlock?.buttonLabel || "";
  const ctaButtonLink =
    ctaBlock?.props?.buttonLink?.value || ctaBlock?.buttonLink || "/shop";

  return (
    <>
      {/* Client-side logic components */}
      <GetAllPages />
      <GetAllMenus />
      <GetAllForms />
      <UpdateCurrentPage />

      {/* Sections — each reads its data from Redux currentPages */}
      <Hero />
      <USP />
      <Services />
      <Collections />
      <ShopByRoom />
      <FeaturedBanner />
      <ProductSlider />
      <Craft />
      <Testimonials />
      <Blog />
      <FAQ />
      <Newsletter />
      <InstagramGallery />
      <LogoStrip />
      <FormComp />
      <DynamicPageSections lang={lang} />

      {ctaBlock && (
        <section
          data-annotate-id="home-cta-section"
          className="bg-foreground/90 text-surface text-center py-[110px] px-[5%] border-t border-border"
        >
          <div className="opacity-100 transform-none">
            <h2 className="text-[38px] lg:text-[48px] font-bold tracking-tight">
              {ctaTitle}
            </h2>
            <p className="text-white/70 font-semibold mt-[18px] mb-[34px] max-w-[600px] mx-auto">
              {ctaDescription}
            </p>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <Link
                href={ctaButtonLink}
                className="bg-primary text-white px-8 h-12 rounded-full text-[14px] font-semibold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center"
              >
                {ctaButtonLabel}
              </Link>
              <Link
                href="/contact"
                className="px-8 h-12 rounded-full border border-white/55 text-white text-[14px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center"
              >
                Book a Consultant
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePageServer;
