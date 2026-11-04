"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchOrders } from "@/lib/store/features/adminOrdersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state: any) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No orders found</TableCell></TableRow>
              ) : (
                items.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber || order._id}</TableCell>
                    <TableCell><Badge variant={order.fulfillmentStatus === "fulfilled" ? "success" : order.fulfillmentStatus === "cancelled" ? "destructive" : "warning"}>{order.fulfillmentStatus || "pending"}</Badge></TableCell>
                    <TableCell>{order.pricing?.total ? `$${order.pricing.total}` : "—"}</TableCell>
                    <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
