import type { ComponentType } from 'react';

// Block imports
import HeroSection from '@/components/cms/sections/HeroSection';
import TextSection from '@/components/cms/sections/TextSection';
import FAQSection from '@/components/cms/sections/FAQSection';
import FeaturedCollectionsSection from '@/components/cms/sections/FeaturedCollectionsSection';
import MetricsSection from '@/components/cms/sections/MetricsSection';
import CTASection from '@/components/cms/sections/CTASection';
import ProductGridSection from '@/components/cms/sections/ProductGridSection';
import TrustBarSection from '@/components/cms/sections/TrustBarSection';
import FeaturedProductsSection from '@/components/cms/sections/FeaturedProductsSection';
import FeaturesBentoSection from '@/components/cms/sections/FeaturesBentoSection';
import ARToolSection from '@/components/cms/sections/ARToolSection';
import SizeTableSection from '@/components/cms/sections/SizeTableSection';
import TestimonialsSection from '@/components/cms/sections/TestimonialsSection';
import PressSection from '@/components/cms/sections/PressSection';
import NewsletterSection from '@/components/cms/sections/NewsletterSection';
import FiltersSection from '@/components/cms/sections/FiltersSection';
import ContactFormSection from '@/components/cms/sections/ContactFormSection';
import CartSection from '@/components/cms/sections/CartSection';
import WishlistSection from '@/components/cms/sections/WishlistSection';
import SearchSection from '@/components/cms/sections/SearchSection';
import AccountSection from '@/components/cms/sections/AccountSection';
import ProfileSection from '@/components/cms/sections/ProfileSection';
import OrdersSection from '@/components/cms/sections/OrdersSection';
import ProductDetailSection from '@/components/cms/sections/ProductDetailSection';
import MeasureGuideSection from '@/components/cms/sections/MeasureGuideSection';
import TipsSection from '@/components/cms/sections/TipsSection';
import ReviewsStatsSection from '@/components/cms/sections/ReviewsStatsSection';
import CustomerReviewsSection from '@/components/cms/sections/CustomerReviewsSection';
import JinjaSectionRenderer from '@/components/sections/JinjaSectionRenderer';
import AboutStorySection from '@/components/cms/sections/AboutStorySection';
import PromotionsSection from '@/components/cms/sections/PromotionsSection';
import HomeTilesSection from '@/components/cms/sections/HomeTilesSection';
import StatementSection from '@/components/cms/sections/StatementSection';

export const blockRegistry: Record<string, ComponentType<any>> = {
  hero: HeroSection,
  'hero.split': HeroSection,
  text: TextSection,
  'rich-text': TextSection,
  'policy.content': TextSection,
  'about-story': AboutStorySection,
  'story.feature': AboutStorySection,
  story: AboutStorySection,
  'faq-accordion': FAQSection,
  'faq.accordion': FAQSection,
  'featured-collections': FeaturedCollectionsSection,
  testimonials: TestimonialsSection,
  metrics: MetricsSection,
  cta: CTASection,
  'product-grid': ProductGridSection,
  'product.grid': ProductGridSection,
  productGrid: ProductGridSection,
  trustBadges: TrustBarSection,
  featuredProducts: FeaturedProductsSection,
  features: FeaturesBentoSection,
  arTool: ARToolSection,
  sizeTable: SizeTableSection,
  press: PressSection,
  newsletter: NewsletterSection,
  filters: FiltersSection,
  'contact-form': ContactFormSection,
  'form-section': ContactFormSection,
  form: ContactFormSection,
  'contact.details': ContactFormSection,
  'contact-details': ContactFormSection,
  'cart-section': CartSection,
  'wishlist-section': WishlistSection,
  'search-section': SearchSection,
  'account-section': AccountSection,
  'profile-section': ProfileSection,
  'orders-section': OrdersSection,
  'product-detail-section': ProductDetailSection,
  'product-section': ProductDetailSection,
  'measure-guide': MeasureGuideSection,
  'tips-section': TipsSection,
  'reviews-stats': ReviewsStatsSection,
  'customer-reviews': CustomerReviewsSection,
  'jinja-component': JinjaSectionRenderer,
  'jinja-features': JinjaSectionRenderer,
  'jinja-template': JinjaSectionRenderer,
  component: JinjaSectionRenderer,
  promotions: PromotionsSection,
  'promotions-grid': PromotionsSection,
  'home-tiles': HomeTilesSection,
  homeTiles: HomeTilesSection,
  statement: StatementSection,
};

export type BlockType = keyof typeof blockRegistry;
