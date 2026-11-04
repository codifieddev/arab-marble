"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">Manage images and media files</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Media library coming soon
        </CardContent>
      </Card>
    </div>
  );
}
