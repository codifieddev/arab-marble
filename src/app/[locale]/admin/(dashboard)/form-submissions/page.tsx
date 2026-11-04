"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFormSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
        <p className="text-muted-foreground">View form submissions</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Form submissions coming soon
        </CardContent>
      </Card>
    </div>
  );
}
