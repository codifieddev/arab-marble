"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector, useAppDispatch } from "../../lib/store/hooks";
import { selectCartTotal, selectShippingCost } from "../../lib/store/cart/cartSlice";
import {
  removeFromCartAsync,
  updateQuantityAsync,
} from "../../lib/store/cart/cartThunk";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  MessageCircleQuestion,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { getEntityUrl } from "@/lib/permalink/url-helper";

const CartPage = () => {
  const { items: cart, loading } = useSelector(
    (state: RootState) => state.cart,
  );
  const cartTotal = useAppSelector(selectCartTotal);
  const shippingCost = useAppSelector(selectShippingCost);
  const dispatch = useAppDispatch();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-[5%]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
            <ShoppingBag size={40} className="text-muted" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Loading cart...
          </h1>
          <p className="text-muted font-semibold mb-10">
            Please wait while we load your cart.
          </p>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-[5%]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
            <ShoppingBag size={40} className="text-muted" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Your cart is empty
          </h1>
          <p className="text-muted font-semibold mb-10">
            Looks like you haven't added anything to your cart yet. Explore our
            collections to find the perfect piece for your home.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-primary text-white px-10 h-14 rounded-full text-[15px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 md:pt-12 px-[5%] max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-12">
        <Link
          href="/shop"
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-3xl md:text-[42px] font-bold tracking-tight">Shopping Cart</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 md:gap-16 items-start">
        {/* Cart Items */}
        <div className="space-y-6 md:space-y-8">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => {
              const variantImageId = item.selectedVariant?.imageId;
              const imageUrl = (variantImageId && item.gallery?.find((d: any) => d.id === variantImageId)?.url)
                || item.gallery?.find((d) => d.id === item.primaryImageId)?.url
                || item.gallery?.[0]?.url
                || "/assets/Image/Sofa.jpg";
              const alt = item.gallery?.find(
                (d) => d.id === (variantImageId || item.primaryImageId),
              )?.alt || item.name || "";
              return (
                <motion.div
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 md:pb-8 border-b border-border group"
                >
                  <div className="w-full sm:w-32 h-48 sm:h-40 bg-surface rounded-2xl overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-secondary transition-colors pr-2">
                          <Link href={getEntityUrl({ type: 'product', slug: item.slug, id: item.id || item._id, name: item.name })}>{item.name}</Link>
                        </h3>
                        <button
                          onClick={() =>
                            dispatch(
                              removeFromCartAsync(String(item.cartItemId)),
                            )
                          }
                          className="text-muted hover:text-red-500 transition-colors p-1 shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-xs md:text-sm text-muted font-bold uppercase tracking-wider mb-2">
                        {item.primaryCategoryId}
                      </p>
                      {item.selectedOptions &&
                        Object.entries(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(item.selectedOptions).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="text-[10px] font-black uppercase bg-muted/20 px-2.5 py-1 rounded-md border border-border/40 text-foreground/70"
                                >
                                  {key}: {value}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      <p className="text-base md:text-lg font-black text-secondary mb-4 sm:mb-0">
                        {item.selectedVariant?.price
                          ? formatPrice(Number(item.selectedVariant.price))
                          : item.price || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-border rounded-full h-10 px-2 bg-surface">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantityAsync({
                                cartItemId: String(item.cartItemId),
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center hover:text-secondary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantityAsync({
                                cartItemId: String(item.cartItemId),
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center hover:text-secondary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border p-8 rounded-3xl sticky top-[140px]"
        >
          <h2 className="text-2xl font-bold mb-8 tracking-tight">
            Order Summary
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-muted font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted font-semibold">
              <span>Shipping</span>
              <span>
                {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-muted font-semibold">
              <span>Tax (GST 18%)</span>
              <span>{formatPrice(cartTotal * 0.18)}</span>
            </div>
            <div className="h-px bg-border my-4" />
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span className="text-secondary">
                {formatPrice(cartTotal * 1.18 + shippingCost)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-primary text-white h-14 rounded-full text-[15px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          <p className="text-[11px] text-center text-muted font-bold uppercase tracking-widest mt-6">
            Secure SSL Encrypted Checkout
          </p>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 pt-16 border-t border-border/40">
        <div className="bg-surface border border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl p-8 flex flex-col items-center text-center group cursor-default">
          <MessageCircleQuestion size={24} className="mb-4 text-foreground/80 group-hover:text-foreground transition-colors" strokeWidth={1.75} />
          <h3 className="font-bold font-sans text-[16px] mb-2">Have Questions?</h3>
          <p className="text-muted text-[14px] font-medium leading-relaxed px-4">
            Our experts are here to help! Call us free.
          </p>
        </div>
        <div className="bg-surface border border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl p-8 flex flex-col items-center text-center group cursor-default">
          <ShieldCheck size={24} className="mb-4 text-foreground/80 group-hover:text-foreground transition-colors" strokeWidth={1.75} />
          <h3 className="font-bold font-sans text-[16px] mb-2">Secure Shopping</h3>
          <p className="text-muted text-[14px] font-medium leading-relaxed px-4">
            All transactions are protected by SSL technology.
          </p>
        </div>
        <div className="bg-surface border border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl p-8 flex flex-col items-center text-center group cursor-default">
          <CheckCircle2 size={24} className="mb-4 text-foreground/80 group-hover:text-foreground transition-colors" strokeWidth={1.75} />
          <h3 className="font-bold font-sans text-[16px] mb-2">Privacy Protection</h3>
          <p className="text-muted text-[14px] font-medium leading-relaxed px-4">
            Your privacy is always our top priority.
          </p>
        </div>
      </div>

      {/* You may also like... */}
      <div className="mt-20">
        <h2 className="text-[22px] font-bold mb-8">You may also like...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Related Product 1 */}
          <div className="border border-border/40 rounded-2xl p-6 flex items-center gap-8 hover:border-black/20 transition-colors">
            <div className="w-32 h-40 bg-[#e8e4e0] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              <img src="/assets/Image/Sofa.jpg" alt="Premium Cotton TShirt" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 tracking-tight">PREMIUM COTTON TSHIRT</h3>
              <div className="flex gap-2 items-center mb-6">
                <span className="text-red-600 font-bold">Rs. 599.00</span>
                <span className="text-muted line-through text-sm">Rs. 999.00</span>
              </div>
              <Link href="/shop" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-muted hover:border-muted transition-colors">
                Select Options
              </Link>
            </div>
          </div>

          {/* Related Product 2 */}
          <div className="border border-border/40 rounded-2xl p-6 flex items-center gap-8 hover:border-black/20 transition-colors">
            <div className="w-32 h-40 bg-[#f6f6f6] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              <img src="/assets/Image/Sofa.jpg" alt="Black Panther Hoodie" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 tracking-tight">Black Panther Hoodie</h3>
              <div className="flex gap-2 items-center mb-6">
                <span className="text-red-600 font-bold">Rs. 1,599.00</span>
                <span className="text-muted line-through text-sm">Rs. 2,599.00</span>
              </div>
              <Link href="/shop" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-muted hover:border-muted transition-colors">
                Select Options
              </Link>
            </div>
          </div>

        </div>

        {/* Dummy Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
          <div className="w-2 h-2 rounded-full bg-black"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
