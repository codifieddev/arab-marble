"use client";

import React, { useEffect } from "react";

import GetAllPages from "./GetAllPages";
import { RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { resetPageComments } from "@/lib/store/comments/commentSlice";
import Hero from "../homepage/hero/Hero";
import USP from "../homepage/usp/USP";
import Services from "../homepage/service/Service";
import Collections from "../homepage/collections/Collections";
import ShopByRoom from "../homepage/shopByRoom/ShopByRoom";
import FeaturedBanner from "../homepage/featuredBanner/FeaturedBanner";
import UpdateCurrentPage from "./UpdateCurrentPage";
import ProductSlider from "../homepage/productSlider/ProductSlider";
import Craft from "../homepage/craft/Craft";
import Testimonials from "../homepage/testimonials/Testimonials";
import Blog from "../homepage/blog/Blog";
import Newsletter from "../homepage/newsletter/Newsletter";
import FAQ from "../homepage/faq/FAQ";
import InstagramGallery from "../homepage/instagram/InstagramGallery";
import LogoStrip from "../homepage/logoStrip/LogoStrip";
import GetAllMenus from "../cms/menus/GetAllMenus";
import GetAllForms from "../forms/GetAllForms";

const HomePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetPageComments());
  }, []);

  return (
    <>


      <GetAllPages />
      <GetAllMenus />
      <GetAllForms />
      <UpdateCurrentPage />

      <Hero />
      <USP />
      <LogoStrip />
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
    </>
  );
};

export default HomePage;
