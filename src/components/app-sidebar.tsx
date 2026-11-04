"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Layers,
  ListOrdered, Tag, Boxes, Palette, Monitor, Image,
  RefreshCw, Settings, Menu, ClipboardCheck,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Layers, label: "Categories", href: "/admin/categories" },
  { icon: ListOrdered, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Pages", href: "/admin/pages" },
  { icon: FileText, label: "Forms", href: "/admin/forms" },
  { icon: ClipboardCheck, label: "Form Submissions", href: "/admin/form-submissions" },
  { icon: Tag, label: "Attributes", href: "/admin/attributes" },
  { icon: Boxes, label: "Variants", href: "/admin/variants" },
  { icon: Palette, label: "Branding", href: "/admin/branding" },
  { icon: Monitor, label: "Theme", href: "/admin/theme" },
  { icon: Image, label: "Media", href: "/admin/media" },
  { icon: RefreshCw, label: "Sync", href: "/admin/sync" },
  { icon: Settings, label: "Settings", href: "/admin/account-settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Menu className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
