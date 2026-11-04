"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
        <p className="text-muted-foreground">Build and manage forms</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Form builder coming soon
        </CardContent>
      </Card>
    </div>
  );
}
