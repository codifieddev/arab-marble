"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminThemePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theme Manager</h1>
        <p className="text-muted-foreground">Customize your store theme</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Theme management coming soon
        </CardContent>
      </Card>
    </div>
  );
}
