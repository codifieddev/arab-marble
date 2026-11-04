"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminVariantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Variants</h1>
        <p className="text-muted-foreground">Manage product variants</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Variant management coming soon
        </CardContent>
      </Card>
    </div>
  );
}
