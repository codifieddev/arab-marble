"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/commerce/orders/${params.id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrder(data.data || data))
      .catch(console.error);
  }, [params.id]);

  if (!order) return <div className="p-8 text-center">Loading order...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
        <Badge variant={order.fulfillmentStatus === "fulfilled" ? "success" : "warning"}>{order.fulfillmentStatus}</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${order.pricing?.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${order.pricing?.shipping}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${order.pricing?.tax}</span></div>
            <div className="flex justify-between font-bold"><span>Total</span><span>${order.pricing?.total}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
          <CardContent>
            <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
