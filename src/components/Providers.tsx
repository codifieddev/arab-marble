"use client";

import GetAllCategories from "@/lib/GetAllDetails/GetAllCategories";
import React from "react";
import GetCart from "@/lib/GetAllDetails/GetCart";
import AnalyticsInjector from "./AnalyticsInjector";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GetAllCategories type="normal" />
      <GetCart />
      <AnalyticsInjector />
      {children}
    </>
  );
}
