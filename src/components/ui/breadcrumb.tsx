import * as React from "react";
import { cn } from "@/lib/utils";

function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav className={cn("flex", className)} aria-label="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("transition-colors hover:text-foreground", className)} href={href} {...props} />;
}

function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("[&>svg]:size-3.5", className)} role="presentation" {...props}>&#47;</span>;
}

function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("font-normal text-foreground", className)} {...props} />;
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage };
