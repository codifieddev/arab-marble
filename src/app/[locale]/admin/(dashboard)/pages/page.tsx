"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">Manage CMS pages</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Page management coming soon
        </CardContent>
      </Card>
    </div>
  );
}
