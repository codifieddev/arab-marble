import { AppSidebar } from "@/components/app-sidebar";
import { BrandingInitializer } from "@/components/branding/BrandingInitializer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandingInitializer>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 p-8 bg-muted/30">
          {children}
        </main>
      </div>
    </BrandingInitializer>
  );
}
