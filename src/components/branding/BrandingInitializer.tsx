"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchBranding } from "@/lib/store/branding/brandingSlice";

interface BrandingInitializerProps {
  children?: React.ReactNode;
}

export function BrandingInitializer({ children }: BrandingInitializerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchBranding());
  }, [dispatch]);

  return <>{children}</>;
}
