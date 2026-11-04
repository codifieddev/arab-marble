import React from "react";
import dynamic from "next/dynamic";

// Dynamically import all ecommerce sections to enable code splitting
const HeroSection = dynamic(() => import("./heroSection/HeroSection"));
const CategoryGrid = dynamic(() => import("./categoryGrid/CategoryGrid"));
const FeaturedCollections = dynamic(() => import("./featuredCollections/FeaturedCollections"));
const ProductGrid = dynamic(() => import("./productGrid/ProductGrid"));
const CtaBanner = dynamic(() => import("./ctaBanner/CtaBanner"));
const Testimonials = dynamic(() => import("./testimonials/Testimonials"));
const FaqSection = dynamic(() => import("./faqSection/FaqSection"));
const NewsletterSection = dynamic(() => import("./newsletterSection/NewsletterSection"));

export const ecommerceRegistry: Record<string, React.ComponentType<any>> = {
  "hero-section": HeroSection,
  "category-grid": CategoryGrid,
  "featured-collections": FeaturedCollections,
  "product-grid": ProductGrid,
  "cta-banner": CtaBanner,
  "testimonials": Testimonials,
  "faq-section": FaqSection,
  "newsletter-section": NewsletterSection,
};
