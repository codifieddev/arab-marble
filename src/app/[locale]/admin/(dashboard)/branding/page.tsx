"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBrandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground">Manage your brand settings</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Branding settings coming soon
        </CardContent>
      </Card>
    </div>
  );
}
