"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Edit2, Minus, Plus, Truck, Package, Calendar } from "lucide-react";
import { useAppDispatch } from "../../lib/store/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  selectCartTotal,
  selectCartCount,
  updateQuantity,
  removeFromCart,
} from "../../lib/store/cart/cartSlice";
import {
  updateQuantityAsync,
  removeFromCartAsync,
} from "../../lib/store/cart/cartThunk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEntityUrl } from "@/lib/permalink/url-helper";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const cartTotal = useSelector(selectCartTotal);
  const cartCount = useSelector(selectCartCount);

    const [activePanel, setActivePanel] = useState<"note" | "estimate" | null>(null);

  const handleUpdateQuantity = (cartItemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      dispatch(updateQuantity({ cartItemId, quantity: newQty })); // Optimistic update
      dispatch(updateQuantityAsync({ cartItemId, quantity: newQty }));
    }
  };

  const handleRemove = (cartItemId: string) => {
    dispatch(removeFromCart(cartItemId)); // Optimistic update
    dispatch(removeFromCartAsync(cartItemId));
  };

  const freeShippingThreshold = 5000;
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const isFreeShipping = cartTotal >= freeShippingThreshold;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[1999]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-surface z-[2000] flex flex-col shadow-2xl border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                Shopping Cart ({cartCount})
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>


            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted font-bold">
                  Your cart is empty.
                </div>
              ) : (
                items.map((item) => {
                  const price = item.selectedVariant?.price
                    ? Number(item.selectedVariant.price)
                    : Number(item.price || item.pricing?.price || 0);

                  const comparePrice = item.pricing?.compareAtPrice
                    ? Number(item.pricing.compareAtPrice)
                    : null;

                  const image =
                    item.gallery?.find((img) => img.id === item.selectedVariant?.imageId)?.url ||
                    item.gallery?.[0]?.url ||
                    "/assets/Image/Sofa.jpg";

                  return (
                    <div key={item.cartItemId} className="flex gap-4">
                      <div className="w-24 h-24 rounded-2xl border border-border overflow-hidden bg-muted/10 shrink-0">
                        <img
                          src={image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground leading-tight">
                            {item.name}
                          </h3>
                          {Object.entries(item.selectedOptions || {}).map(([key, value]) => (
                            <p key={key} className="text-xs text-muted mt-1">
                              {key}: {value}
                            </p>
                          ))}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-red-600 font-bold text-sm">
                              Rs. {price.toLocaleString("en-IN")}
                            </span>
                            {comparePrice && (
                              <span className="text-muted line-through text-xs">
                                Rs. {comparePrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center h-8 rounded-lg border border-border bg-surface px-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.cartItemId!, item.quantity, -1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted/10 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.cartItemId!, item.quantity, 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted/10 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted">
                            <Link href={getEntityUrl({ type: 'product', slug: item.slug, id: item.id || item._id, name: item.name })} onClick={onClose} className="p-1 hover:text-foreground transition-colors">
                              <Edit2 size={14} />
                            </Link>
                            <button
                              onClick={() => handleRemove(item.cartItemId!)}
                              className="p-1 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 border-y border-border divide-x divide-border">
              <button
                onClick={() => setActivePanel("note")}
                className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-muted hover:text-foreground transition-colors hover:bg-muted/5"
              >
                <Calendar size={16} /> Add Note
              </button>
              <button
                onClick={() => setActivePanel("estimate")}
                className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-muted hover:text-foreground transition-colors hover:bg-muted/5"
              >
                <Package size={16} /> Estimate
              </button>
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-foreground">Subtotal</span>
                <span className="text-lg font-black text-foreground">
                  Rs. {cartTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-center w-full py-3 rounded-xl border border-black text-black font-semibold hover:bg-black/5 transition-colors"
                >
                  View Cart
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/checkout");
                  }}
                  disabled={items.length === 0}
                  className={`flex items-center justify-center w-full py-3 rounded-xl font-semibold transition-colors ${
                    items.length === 0
                      ? "bg-black/5 text-muted cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-primary/20 shadow-lg"
                  }`}
                >
                  Checkout
                </button>
              </div>
            </div>

            {/* Overlay Backdrop */}
            <AnimatePresence>
              {activePanel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActivePanel(null)}
                  className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-40"
                />
              )}
            </AnimatePresence>

            {/* Sliding Panels */}
            <AnimatePresence>
              {activePanel && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-x-0 bottom-0 bg-[#f6f6f6] z-50 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
                >
                  {activePanel === "note" && (
                    <div className="p-6 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar size={20} />
                        <h3 className="text-lg font-bold">Add Order Note</h3>
                      </div>
                      <textarea
                        placeholder="How can we help you?"
                        rows={6}
                        className="w-full p-4 rounded-xl border border-border bg-white resize-none focus:outline-none focus:border-black mb-6"
                      />
                      <div className="space-y-3">
                        <button
                          onClick={() => setActivePanel(null)}
                          className="w-full py-4 rounded-xl bg-black text-white font-black hover:bg-black/90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setActivePanel(null)}
                          className="w-full py-4 rounded-xl border border-black text-black font-black hover:bg-black/5 transition-colors bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {activePanel === "estimate" && (
                    <div className="p-6 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-6">
                        <Package size={20} />
                        <h3 className="text-lg font-bold">Estimate Shipping</h3>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm text-muted mb-2">Country/region</label>
                          <select className="w-full p-4 rounded-xl border border-border bg-white focus:outline-none focus:border-black appearance-none">
                            <option>United States</option>
                            <option>India</option>
                            <option>United Kingdom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-muted mb-2">Province</label>
                          <select className="w-full p-4 rounded-xl border border-border bg-white focus:outline-none focus:border-black appearance-none">
                            <option>Alabama</option>
                            <option>California</option>
                            <option>New York</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-muted mb-2">Postal/ZIP code</label>
                          <input
                            type="text"
                            placeholder="Postal/ZIP code"
                            className="w-full p-4 rounded-xl border border-border bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => setActivePanel(null)}
                          className="w-full py-4 rounded-xl bg-black text-white font-black hover:bg-black/90 transition-colors"
                        >
                          Estimate Shipping
                        </button>
                        <button
                          onClick={() => setActivePanel(null)}
                          className="w-full py-4 rounded-xl border border-black text-black font-black hover:bg-black/5 transition-colors bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
