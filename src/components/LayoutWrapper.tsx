"use client";
import { usePathname } from "next/navigation";
import SiteChrome from "./SiteChrome";

export default function LayoutWrapper({
  children,
  brandConfig,
}: {
  children: React.ReactNode;
  brandConfig: any;
}) {
  const pathname = usePathname();
  
  // If we are in the admin panel or on auth pages, do not render the storefront header and footer
  const segments = pathname?.split("/") || [];
  const isExcluded = segments.some(
    (s) => s === "admin" || s === "login" || s === "signup" || s === "kalpauth",
  );

  if (isExcluded) {
    return <>{children}</>;
  }

  // Otherwise, wrap children in the standard Peekeeper header and footer
  return <SiteChrome brandConfig={brandConfig}>{children}</SiteChrome>;
}

