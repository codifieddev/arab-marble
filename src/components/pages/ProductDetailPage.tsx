// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, Link } from "@/lib/router";
// import { motion, AnimatePresence } from "motion/react";
// import {
//   Star,
//   Heart,
//   Minus,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Truck,
//   RotateCcw,
//   Info,
//   Check,
// } from "lucide-react";
// import { useAppDispatch } from "../../lib/store/hooks";
// import { addToCart } from "../../lib/store/features/cartSlice";
// import { RootState } from "@/lib/store/store";
// import { useSelector } from "react-redux";

// const ProductDetailPage = ({ currentProduct }: { currentProduct: any }) => {
//   const { allCategories } = useSelector(
//     (state: RootState) => state.adminCategories,
//   );

//   console.log("currentProduct", currentProduct, allCategories);

//   const { id } = useParams<{ id: string }>();
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [openAccordion, setOpenAccordion] = useState<string | null>("details");
//   const [isAdded, setIsAdded] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState<any>(null);
//   const [selectedOptions, setSelectedOptions] = useState<
//     Record<string, string>
//   >({});

//   const dispatch = useAppDispatch();

//   // Get primary image URL
//   const primaryImage = useMemo(() => {
//     if (!currentProduct) return "";
//     const primaryImg = currentProduct.gallery?.find(
//       (img: any) => img.id === currentProduct.primaryImageId,
//     );
//     return primaryImg?.url || currentProduct.gallery?.[0]?.url || "";
//   }, [currentProduct]);

//   // Get all gallery images
//   const galleryImages = useMemo(() => {
//     if (!currentProduct?.gallery) return [];
//     return currentProduct.gallery.map((img: any) => img.url);
//   }, [currentProduct]);

//   // Build category breadcrumb path
//   const categoryPath = useMemo(() => {
//     if (!currentProduct || !allCategories) return [];

//     const buildPath = (categoryId: string, path: any[] = []): any[] => {
//       const category = allCategories.find((c: any) => c._id === categoryId);
//       if (!category) return path;

//       path.unshift(category);
//       if (category.parentId) {
//         return buildPath(category.parentId, path);
//       }
//       return path;
//     };

//     if (currentProduct.primaryCategoryId) {
//       return buildPath(currentProduct.primaryCategoryId);
//     }
//     return [];
//   }, [currentProduct, allCategories]);

//   // Get primary category name
//   const primaryCategory = useMemo(() => {
//     if (!currentProduct || !allCategories) return "";
//     const category = allCategories.find(
//       (c: any) => c._id === currentProduct.primaryCategoryId,
//     );
//     return category?.title || "";
//   }, [currentProduct, allCategories]);

//   // Get variant options (options marked for variants)
//   const variantOptions = useMemo(() => {
//     if (!currentProduct?.options) return [];
//     return currentProduct.options.filter((opt: any) => opt.useForVariants);
//   }, [currentProduct]);

//   // Initialize selected variant and options
//   useEffect(() => {
//     if (currentProduct?.variants && currentProduct.variants.length > 0) {
//       const firstVariant = currentProduct.variants[0];
//       setSelectedVariant(firstVariant);
//       setSelectedOptions(firstVariant.optionValues || {});
//     }
//   }, [currentProduct]);

//   // Handle option selection
//   const handleOptionChange = (optionKey: string, value: string) => {
//     const newOptions = { ...selectedOptions, [optionKey]: value };
//     setSelectedOptions(newOptions);

//     // Find matching variant
//     const matchingVariant = currentProduct?.variants?.find((variant: any) => {
//       return Object.keys(newOptions).every(
//         (key) => variant.optionValues[key] === newOptions[key],
//       );
//     });

//     if (matchingVariant) {
//       setSelectedVariant(matchingVariant);
//     }
//   };

//   // Get current price
//   const currentPrice = useMemo(() => {
//     if (selectedVariant) {
//       return `₹${parseInt(selectedVariant.price).toLocaleString("en-IN")}`;
//     }
//     return `₹${parseInt(currentProduct?.pricing?.price || 0).toLocaleString("en-IN")}`;
//   }, [selectedVariant, currentProduct]);

//   // Get compare at price
//   const compareAtPrice = useMemo(() => {
//     if (currentProduct?.pricing?.compareAtPrice) {
//       return `₹${parseInt(currentProduct.pricing.compareAtPrice).toLocaleString("en-IN")}`;
//     }
//     return null;
//   }, [currentProduct]);

//   // Calculate discount percentage
//   const discountPercentage = useMemo(() => {
//     if (
//       currentProduct?.pricing?.compareAtPrice &&
//       currentProduct?.pricing?.price
//     ) {
//       const original = parseInt(currentProduct.pricing.compareAtPrice);
//       const current = parseInt(currentProduct.pricing.price);
//       return Math.round(((original - current) / original) * 100);
//     }
//     return null;
//   }, [currentProduct]);

//   // Get stock status
//   const stockStatus = useMemo(() => {
//     if (selectedVariant) {
//       const stock = parseInt(selectedVariant.stock || 0);
//       if (stock === 0) return { text: "Out of Stock", color: "text-red-500" };
//       if (stock < 5)
//         return { text: `Only ${stock} left`, color: "text-orange-500" };
//       return { text: "In Stock", color: "text-green-500" };
//     }
//     return { text: "In Stock", color: "text-green-500" };
//   }, [selectedVariant]);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [id]);

//   if (!currentProduct) {
//     return (
//       <div className="container mx-auto px-[5%] py-32 text-center">
//         <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
//         <p className="text-muted font-bold mb-8">
//           The product you are looking for does not exist or has been moved.
//         </p>
//         <Link
//           href="/shop"
//           className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-wider"
//         >
//           Back to Shop
//         </Link>
//       </div>
//     );
//   }

//   const toggleAccordion = (key: string) => {
//     setOpenAccordion(openAccordion === key ? null : key);
//   };

//   const handleAddToCart = () => {
//   const handleAddToCart = () => {
//     const productToAdd = {
//       ...currentProduct,
//       selectedVariant,
//       selectedOptions,
//       quantity,
//     };
//     dispatch(addToCart(productToAdd));
//     setIsAdded(true);
//     setTimeout(() => setIsAdded(false), 2000);
//   };

//   return (
//     <div className="mx-auto px-[5%] pb-20">
//       {/* Breadcrumbs */}
//       <div className="crumbs">
//         <Link href="/">Home</Link> <span>›</span>
//         <Link href="/shop">Shop</Link> <span>›</span>
//         {categoryPath.map((cat: any, idx: number) => (
//           <React.Fragment key={cat._id}>
//             <Link href={`/category/${cat.slug}`}>{cat.title}</Link>
//             {idx < categoryPath.length - 1 && <span>›</span>}
//           </React.Fragment>
//         ))}
//         {categoryPath.length > 0 && <span>›</span>}
//         <strong>{currentProduct.name}</strong>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-start">
//         {/* LEFT: GALLERY */}
//         <div className="space-y-4">
//           <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-border bg-muted/5">
//             {discountPercentage && (
//               <div className="badge absolute top-6 left-6 z-10 dark:bg-surface/62 dark:border-secondary/18">
//                 {discountPercentage}% OFF
//               </div>
//             )}
//             <img
//               src={galleryImages[selectedImage] || primaryImage}
//               alt={currentProduct.name}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           {galleryImages.length > 1 && (
//             <div className="grid grid-cols-4 gap-4">
//               {galleryImages.slice(0, 4).map((img: string, idx: number) => (
//                 <button
//                   key={idx}
//                   onClick={() => setSelectedImage(idx)}
//                   className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-secondary shadow-md" : "border-border hover:border-secondary/40"}`}
//                 >
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* RIGHT: INFO */}
//         <div className="lg:sticky lg:top-[128px] space-y-8">
//           <div className="space-y-4">
//             <div className="flex justify-between items-start gap-4">
//               <div>
//                 <small className="text-secondary tracking-[3px] uppercase text-[10px] font-black mb-2 block">
//                   {primaryCategory}
//                 </small>
//                 <h1 className="text-[48px] font-black leading-[1.05] tracking-tight">
//                   {currentProduct.name}
//                 </h1>
//               </div>
//               <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted/10 transition-all shrink-0">
//                 <Heart size={20} />
//               </button>
//             </div>

//             <div className="flex items-center gap-6 flex-wrap">
//               <div className="flex items-center gap-3">
//                 <div className="text-[32px] font-black text-foreground/90">
//                   {currentPrice}
//                 </div>
//                 {compareAtPrice && (
//                   <div className="text-[18px] font-bold text-muted line-through">
//                     {compareAtPrice}
//                   </div>
//                 )}
//               </div>
//               <div
//                 className={`text-[11px] font-black uppercase tracking-[1px] ${stockStatus.color}`}
//               >
//                 {stockStatus.text}
//               </div>
//             </div>

//             {currentProduct.sku && (
//               <div className="text-[11px] font-black uppercase tracking-[1px] text-muted">
//                 SKU: {selectedVariant?.sku || currentProduct.sku}
//               </div>
//             )}
//           </div>

//           <p className="text-muted font-bold leading-relaxed text-[15px]">
//             {currentProduct.description}
//           </p>

//           {/* Variant Options */}
//           {variantOptions.length > 0 && (
//             <div className="space-y-6 py-6 border-y border-border/60">
//               {variantOptions.map((option: any) => (
//                 <div key={option.key} className="space-y-3">
//                   <label className="text-[11px] font-black uppercase tracking-[2px] text-foreground/70">
//                     Select {option.label}
//                   </label>
//                   <div className="flex flex-wrap gap-2.5">
//                     {option.selectedValues.map((value: string) => (
//                       <button
//                         key={value}
//                         onClick={() => handleOptionChange(option.key, value)}
//                         className={`h-11 px-6 rounded-xl border font-black text-[13px] transition-all ${
//                           selectedOptions[option.key] === value
//                             ? "border-secondary bg-secondary/10 text-secondary"
//                             : "border-border hover:border-secondary/40"
//                         }`}
//                       >
//                         {value}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Non-variant Options (for display only) */}
//           {currentProduct.options
//             ?.filter(
//               (opt: any) =>
//                 !opt.useForVariants && opt.selectedValues?.length > 0,
//             )
//             .map((option: any) => (
//               <div
//                 key={option.key}
//                 className="space-y-3 py-4 border-t border-border/60"
//               >
//                 <label className="text-[11px] font-black uppercase tracking-[2px] text-foreground/70">
//                   {option.label}
//                 </label>
//                 <div className="text-[14px] font-bold text-foreground/80">
//                   {option.selectedValues.join(", ")}
//                 </div>
//               </div>
//             ))}

//           {/* Actions */}
//           <div className="flex gap-4">
//             <div className="flex items-center h-14 rounded-full border border-border bg-surface px-2">
//               <button
//                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/10 transition-all"
//               >
//                 <Minus size={16} />
//               </button>
//               <span className="w-10 text-center font-black text-sm">
//                 {quantity}
//               </span>
//               <button
//                 onClick={() => setQuantity(quantity + 1)}
//                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/10 transition-all"
//               >
//                 <Plus size={16} />
//               </button>
//             </div>
//             <button
//               onClick={handleAddToCart}
//               disabled={stockStatus.text === "Out of Stock"}
//               className={`flex-1 h-14 rounded-full text-xs font-black uppercase tracking-[2px] shadow-lg transition-all flex items-center justify-center gap-2 ${
//                 stockStatus.text === "Out of Stock"
//                   ? "bg-muted text-muted-foreground cursor-not-allowed"
//                   : isAdded
//                     ? "bg-emerald-600 text-white shadow-emerald-600/20"
//                     : "bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5"
//               }`}
//             >
//               {stockStatus.text === "Out of Stock" ? (
//                 "Out of Stock"
//               ) : isAdded ? (
//                 <>
//                   <Check size={18} /> Added to Bag
//                 </>
//               ) : (
//                 <>Add to Bag — {currentPrice}</>
//               )}
//             </button>
//           </div>

//           {/* Accordions */}
//           <div className="space-y-px bg-border rounded-2xl overflow-hidden border border-border">
//             {[
//               {
//                 id: "details",
//                 title: "Product Details",
//                 icon: <Info size={18} />,
//                 content:
//                   currentProduct.description ||
//                   "Handcrafted with precision using sustainable materials. Features a durable frame and premium upholstery designed for long-lasting comfort.",
//               },
//               {
//                 id: "shipping",
//                 title: "Shipping Info",
//                 icon: <Truck size={18} />,
//                 content:
//                   "Free standard shipping on all orders over ₹25,000. Delivered within 5-7 business days with real-time tracking.",
//               },
//               {
//                 id: "returns",
//                 title: "Returns & Warranty",
//                 icon: <RotateCcw size={18} />,
//                 content:
//                   "30-day hassle-free returns and a 2-year comprehensive warranty on all structural components.",
//               },
//             ].map((item) => (
//               <div key={item.id} className="bg-surface">
//                 <button
//                   onClick={() => toggleAccordion(item.id)}
//                   className="w-full p-5 flex items-center justify-between gap-4 hover:bg-muted/5 transition-all"
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="text-secondary">{item.icon}</span>
//                     <span className="text-[13px] font-black uppercase tracking-[1px]">
//                       {item.title}
//                     </span>
//                   </div>
//                   {openAccordion === item.id ? (
//                     <ChevronUp size={18} />
//                   ) : (
//                     <ChevronDown size={18} />
//                   )}
//                 </button>
//                 <AnimatePresence>
//                   {openAccordion === item.id && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       className="overflow-hidden"
//                     >
//                       <div className="p-[0_20px_20px_52px] text-[14px] text-muted font-bold leading-relaxed">
//                         {item.content}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Tabs Section */}
//       <section className="mt-24">
//         <div className="flex border-b border-border mb-10 overflow-x-auto no-scrollbar">
//           {["overview", "specifications", "reviews"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-8 py-4 text-[11px] font-black uppercase tracking-[2px] transition-all relative whitespace-nowrap ${activeTab === tab ? "text-secondary" : "text-muted hover:text-foreground"}`}
//             >
//               {tab}
//               {activeTab === tab && (
//                 <motion.div
//                   layoutId="activeTab"
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
//                 />
//               )}
//             </button>
//           ))}
//         </div>

//         <div className="min-h-[300px]">
//           {activeTab === "overview" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//               <div className="space-y-6">
//                 <h2 className="text-[42px] font-black leading-[1.1]">
//                   Crafted for Modern Living
//                 </h2>
//                 <p className="text-muted font-bold text-lg leading-relaxed">
//                   Our {currentProduct.name} is more than just a piece of
//                   furniture; it's a statement of style and a commitment to
//                   quality. Every detail has been carefully considered to provide
//                   you with the best possible experience.
//                 </p>
//                 <ul className="space-y-4">
//                   {[
//                     "Premium Quality Materials",
//                     "Ergonomic Design",
//                     "Expert Craftsmanship",
//                     "Easy Assembly",
//                   ].map((feature) => (
//                     <li
//                       key={feature}
//                       className="flex items-center gap-3 font-bold text-foreground/80"
//                     >
//                       <div className="w-2 h-2 rounded-full bg-secondary" />
//                       {feature}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="rounded-[32px] overflow-hidden aspect-video border border-border">
//                 <img
//                   src={galleryImages[1] || primaryImage}
//                   alt="Detail"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//           )}

//           {activeTab === "specifications" && (
//             <div className="max-w-3xl mx-auto space-y-4">
//               {[
//                 { label: "Product Type", value: currentProduct.type },
//                 { label: "SKU", value: currentProduct.sku },
//                 { label: "Status", value: currentProduct.status },
//                 ...(currentProduct.options || [])
//                   .filter((opt: any) => opt.selectedValues?.length > 0)
//                   .map((opt: any) => ({
//                     label: opt.label,
//                     value: opt.selectedValues.join(", "),
//                   })),
//               ].map((spec) => (
//                 <div
//                   key={spec.label}
//                   className="flex justify-between p-4 border-b border-border/50"
//                 >
//                   <span className="text-[11px] font-black uppercase tracking-[2px] text-muted">
//                     {spec.label}
//                   </span>
//                   <span className="font-bold capitalize">{spec.value}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {activeTab === "reviews" && (
//             <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
//               <div className="space-y-6">
//                 <div className="p-8 rounded-3xl border border-border bg-surface text-center space-y-2">
//                   <div className="text-[64px] font-black leading-none">4.8</div>
//                   <div className="flex justify-center gap-1">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={20}
//                         className={
//                           i < 4
//                             ? "text-secondary fill-secondary"
//                             : "text-border"
//                         }
//                       />
//                     ))}
//                   </div>
//                   <p className="text-[11px] font-black uppercase tracking-[2px] text-muted">
//                     Based on customer reviews
//                   </p>
//                 </div>
//                 <button className="w-full h-14 rounded-full border border-secondary text-secondary font-black text-xs uppercase tracking-[2px] hover:bg-secondary hover:text-white transition-all">
//                   Write a Review
//                 </button>
//               </div>
//               <div className="space-y-8">
//                 <div className="text-center text-muted font-bold py-12">
//                   No reviews yet. Be the first to review this product!
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Related Products - You can fetch these based on relatedProductIds */}
//       {currentProduct.relatedProductIds?.length > 0 && (
//         <section className="mt-32">
//           <div className="flex justify-between items-end mb-10">
//             <div>
//               <small className="text-secondary tracking-[3px] uppercase text-[10px] font-black mb-2 block">
//                 Curated for you
//               </small>
//               <h2 className="text-[42px] font-black leading-[1.1]">
//                 Related Products
//               </h2>
//             </div>
//             <Link
//               href="/categories"
//               className="text-[11px] font-black uppercase tracking-[2px] text-secondary border-b border-secondary pb-1 hover:opacity-70 transition-all"
//             >
//               View All
//             </Link>
//           </div>
//           {/* Add related products grid here */}
//         </section>
//       )}
//     </div>
//   );
// };

// export default ProductDetailPage;

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  Info,
  Check,
  Share2,
  HelpCircle,
  Eye,
  Flame,
  X,
  Copy,
  Globe as FacebookIcon,
  MessageCircle as TwitterIcon,
} from "lucide-react";
import { useAppDispatch } from "../../lib/store/hooks";
import { addToCartAsync } from "../../lib/store/cart/cartThunk";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { composeVariantKey } from "@/lib/admin-products/utils";
import CartSidebar from "../ecommerce/CartSidebar";
import { updateWishlistThunk } from "@/lib/store/auth/authThunks";
import { toast } from "sonner";
import { getEntityUrl } from "@/lib/permalink/url-helper";

const ProductDetailPage = ({ currentProduct }: { currentProduct: any }) => {
  const { allCategories } = useSelector(
    (state: RootState) => state.adminCategories,
  );
  const pathname = usePathname();
  const router = useRouter();

  const { items, loading, error, hasCartFetched } = useSelector(
    (state: RootState) => state.cart,
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const { id } = useParams<{ id: string }>();
  const locale = (useParams()?.locale as string) || "en";

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [isAdded, setIsAdded] = useState(false);
  const getDefaultOptions = (product: any) => {
    const firstVariant = product?.variants?.[0];
    if (!firstVariant) return {};
    const options: Record<string, string> = {};
    firstVariant.attributeValues?.forEach((av: any) => {
      options[av.attributeId] = av.value;
    });
    return options;
  };

  const [selectedVariant, setSelectedVariant] = useState<any>(
    () => currentProduct?.variants?.[0] || null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => getDefaultOptions(currentProduct));
  const dispatch = useAppDispatch();

  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  const productIdStr = String(currentProduct?._id || currentProduct?.id || "default");
  const isWishlisted = Boolean(
    productIdStr !== "default" && user?.wishlist?.includes(productIdStr),
  );

  const handleWishlist = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.info("Log in to save products to your wishlist");
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (productIdStr === "default") return;

    try {
      await dispatch(
        updateWishlistThunk({ productId: productIdStr, add: !isWishlisted }),
      ).unwrap();
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      );
    } catch (wishlistError) {
      toast.error(
        wishlistError instanceof Error
          ? wishlistError.message
          : "Could not update wishlist",
      );
    }
  };

  const getDeterministicRandom = (str: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0;
    }
    const normalized = Math.abs(hash) / 2147483648;
    return Math.floor(normalized * (max - min + 1)) + min;
  };

  const soldCount = useMemo(() => getDeterministicRandom(productIdStr + "sold", 5, 35), [productIdStr]);
  const soldHours = useMemo(() => getDeterministicRandom(productIdStr + "hours", 1, 24), [productIdStr]);
  const viewingCount = useMemo(() => getDeterministicRandom(productIdStr + "view", 10, 50), [productIdStr]);
  
  const leftInStock = useMemo(() => {
    if (selectedVariant?.stock) {
      const stock = parseInt(selectedVariant.stock);
      if (!isNaN(stock) && stock > 0) return stock;
    }
    return getDeterministicRandom(productIdStr + "stock", 3, 15);
  }, [selectedVariant, productIdStr]);

  // Get primary image URL
  const primaryImage = useMemo(() => {
    if (!currentProduct) return "/assets/Image/Sofa.jpg";
    const primaryImg = currentProduct.gallery?.find(
      (img: any) => img.id === currentProduct.primaryImageId,
    );
    return (
      primaryImg?.url ||
      currentProduct.gallery?.[0]?.url ||
      "/assets/Image/Sofa.jpg"
    );
  }, [currentProduct]);

  // Get all gallery images
  const galleryImages = useMemo(() => {
    if (!currentProduct?.gallery || currentProduct.gallery.length === 0)
      return ["/assets/Image/Sofa.jpg"];
    return currentProduct.gallery.map((img: any) => img.url);
  }, [currentProduct]);

  // Build category breadcrumb path
  const categoryPath = useMemo(() => {
    if (!currentProduct || !allCategories) return [];

    const buildPath = (categoryId: string, path: any[] = []): any[] => {
      const category = allCategories.find((c: any) => c._id === categoryId);
      if (!category) return path;

      path.unshift(category);
      if (category.parentId) {
        return buildPath(category.parentId, path);
      }
      return path;
    };

    if (currentProduct.primaryCategoryId) {
      return buildPath(currentProduct.primaryCategoryId);
    }
    return [];
  }, [currentProduct, allCategories]);

  // Get primary category name
  const primaryCategory = useMemo(() => {
    if (!currentProduct || !allCategories) return "";
    const category = allCategories.find(
      (c: any) => c._id === currentProduct.primaryCategoryId,
    );
    return category?.title || "";
  }, [currentProduct, allCategories]);

  // Get variant options (options marked for variants)
  const variantOptions = useMemo(() => {
    if (!currentProduct?.options) return [];
    return currentProduct.options.filter((opt: any) => opt.useForVariants);
  }, [currentProduct]);

  // Group options by attributeSetId for specifications
  const groupedOptions = useMemo(() => {
    if (!currentProduct?.options) return {};

    const groups: Record<string, any[]> = {};

    currentProduct.options.forEach((option: any) => {
      if (option.selectedValues && option.selectedValues.length > 0) {
        const setId = option.attributeSetId || "other";
        if (!groups[setId]) {
          groups[setId] = [];
        }
        groups[setId].push(option);
      }
    });

    return groups;
  }, [currentProduct]);

  // Reset variant/options when navigating to a different product
  useEffect(() => {
    if (currentProduct?.variants?.length) {
      const firstVariant = currentProduct.variants[0];
      setSelectedVariant(firstVariant);
      const options: Record<string, string> = {};
      firstVariant.attributeValues?.forEach((av: any) => {
        options[av.attributeId] = av.value;
      });
      setSelectedOptions(options);
    }
  }, [currentProduct?.id]);

  // Handle option selection
  const handleOptionChange = (optionKey: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionKey]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const matchingVariant = currentProduct?.variants?.find((variant: any) => {
      const variantOptions: Record<string, string> = {};
      variant.attributeValues?.forEach((av: any) => {
        variantOptions[av.attributeId] = av.value;
      });
      return Object.keys(newOptions).every(
        (key) => variantOptions[key] === newOptions[key],
      );
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      if (matchingVariant.imageId && currentProduct?.gallery) {
        const imgIndex = currentProduct.gallery.findIndex(
          (img: any) => img.id === matchingVariant.imageId,
        );
        if (imgIndex !== -1) {
          setSelectedImage(imgIndex);
        }
      }
    }
  };

  // Get current price
  const currentPrice = useMemo(() => {
    if (selectedVariant) {
      return `₹${parseInt(selectedVariant.price).toLocaleString("en-IN")}`;
    }
    return `₹${parseInt(currentProduct?.pricing?.price || 0).toLocaleString("en-IN")}`;
  }, [selectedVariant, currentProduct]);

  // Get compare at price
  const compareAtPrice = useMemo(() => {
    if (currentProduct?.pricing?.compareAtPrice) {
      return `₹${parseInt(currentProduct.pricing.compareAtPrice).toLocaleString("en-IN")}`;
    }
    return null;
  }, [currentProduct]);

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (
      currentProduct?.pricing?.compareAtPrice &&
      currentProduct?.pricing?.price
    ) {
      const original = parseInt(currentProduct.pricing.compareAtPrice);
      const current = parseInt(currentProduct.pricing.price);
      return Math.round(((original - current) / original) * 100);
    }
    return null;
  }, [currentProduct]);

  // Get stock status
  const stockStatus = useMemo(() => {
    if (selectedVariant) {
      const stock = parseInt(selectedVariant.stock || 0);
      if (stock === 0) return { text: "Out of Stock", color: "text-red-500" };
      if (stock < 5)
        return { text: `Only ${stock} left`, color: "text-orange-500" };
      return { text: "In Stock", color: "text-green-500" };
    }
    return { text: "In Stock", color: "text-green-500" };
  }, [selectedVariant]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-[5%] py-32 text-center">
        <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
        <p className="text-muted font-bold mb-8">
          The product you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/shop"
          className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-wider"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  const handleAddToCart = () => {
    const variantKey = composeVariantKey(selectedOptions || {});
    const cartItemId = `${currentProduct.id}-${variantKey}`;

    const productToAdd = {
      ...currentProduct,
      selectedVariant,
      selectedOptions,
      quantity,
      cartItemId,
    };
    dispatch(addToCartAsync(productToAdd));
    setIsAdded(true);
    setIsCartSidebarOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="mx-auto px-[5%] pb-20">
      {/* Breadcrumbs */}
      <div className="crumbs">
        <Link href="/">Home</Link> <span>›</span>
        <Link href="/shop">Shop</Link> <span>›</span>
        {categoryPath.map((cat: any, idx: number) => (
          <React.Fragment key={cat._id}>
            <Link href={getEntityUrl({ type: "category", slug: cat.slug, id: cat._id }, locale)}>{cat.title}</Link>
            {idx < categoryPath.length - 1 && <span>›</span>}
          </React.Fragment>
        ))}
        {categoryPath.length > 0 && <span>›</span>}
        <strong>{currentProduct.name}</strong>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-start">
        {/* LEFT: GALLERY */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-border bg-muted/5">
            <img
              src={galleryImages[selectedImage] || primaryImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.slice(0, 4).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-secondary shadow-md" : "border-border hover:border-secondary/40"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: INFO */}
        <div className="lg:sticky lg:top-[128px] space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <small className="text-secondary tracking-[3px] uppercase text-[10px] font-black mb-2 block">
                  {primaryCategory}
                </small>
                {discountPercentage && (
                  <div className="inline-block bg-red-500/90 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-sm">
                    -{discountPercentage}%
                  </div>
                )}
                <h1 className="text-[32px] font-black leading-[1.05] tracking-tight">
                  {currentProduct.name}
                </h1>
                <div className="mt-4 inline-flex items-center gap-2 text-red-500 text-sm font-bold">
                  <Flame size={16} />
                  {soldCount} sold in last {soldHours} hours
                </div>
              </div>
              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-border hover:bg-muted/10"
                }`}
              >
                <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-[32px] font-black text-foreground/90">
                  {currentPrice}
                </div>
                {compareAtPrice && (
                  <div className="text-[18px] font-bold text-muted line-through">
                    {compareAtPrice}
                  </div>
                )}
              </div>
              <div
                className={`text-[11px] font-black uppercase tracking-[1px] ${stockStatus.color}`}
              >
                {stockStatus.text}
              </div>
            </div>

         

            <div className="inline-flex items-center gap-3 mt-4 text-sm font-bold text-foreground">
              <div className="bg-black text-white p-1.5 rounded flex items-center justify-center">
                <Eye size={14} />
              </div>
              {viewingCount} peoples are viewing this right now
            </div>

            {currentProduct.sku && (
              <div className="text-[11px] font-black uppercase tracking-[1px] text-muted">
                SKU: {selectedVariant?.sku || currentProduct.sku}
              </div>
            )}
          </div>

          <p className="text-muted font-medium leading-relaxed text-[15px] line-clamp-3">
            {currentProduct.description}
          </p>

          {/* Variant Options ONLY */}
          {variantOptions.length > 0 && (
            <div className="space-y-6 py-4 border-y border-border/60">
              {variantOptions.map((option: any) => (
                <div key={option.key} className="space-y-3">
                  <label className="text-[11px] mb-4  font-black uppercase tracking-[2px] text-foreground/70">
                    Select {option.label}
                  </label>
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {option.selectedValues.map((value: string) => (
                      <button
                        key={value}
                        onClick={() => handleOptionChange(option.key, value)}
                        className={`h-11 px-6 cursor-pointer rounded-xl border font-black text-[13px] transition-all ${
                          selectedOptions[option.key] === value
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-border hover:border-secondary/40"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {/* Compare, Ask, Share */}
          <div className="flex items-center  gap-4 py-2 flex-wrap ">
        
            <button
              onClick={() => setIsAskQuestionOpen(true)}
              className="flex cursor-pointer items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors border-r border-border/60 pr-4"
            >
              <HelpCircle size={16} /> Ask a question
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex cursor-pointer items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Hurry up */}
          {leftInStock < 5 && (
            <div className="flex items-center gap-2 text-[15px] font-bold text-foreground mb-4">
              <Flame size={18} className="text-orange-500" />
              Hurry up! Only <span className="text-red-500">{leftInStock} item(s)</span> items left in stock
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex items-center h-14 rounded-full border border-border bg-surface px-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/10 transition-all"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-black text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/10 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={stockStatus.text === "Out of Stock"}
              className={`flex-1 h-14 cursor-pointer rounded-full text-xs font-black uppercase tracking-[2px] shadow-lg transition-all flex items-center justify-center gap-2 ${
                stockStatus.text === "Out of Stock"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : isAdded
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5"
              }`}
            >
              {stockStatus.text === "Out of Stock" ? (
                "Out of Stock"
              ) : isAdded ? (
                <>
                  <Check size={18} /> Added to Bag
                </>
              ) : (
                <>Add to Bag — {currentPrice}</>
              )}
            </button>
          </div>

          {/* Accordions */}
          <div className="space-y-px bg-border rounded-2xl overflow-hidden border border-border">
            {[
              {
                id: "details",
                title: "Product Details",
                icon: <Info size={18} />,
                content:
                  currentProduct.description ||
                  "Handcrafted with precision using sustainable materials. Features a durable frame and premium upholstery designed for long-lasting comfort.",
              },
              {
                id: "shipping",
                title: "Shipping Info",
                icon: <Truck size={18} />,
                content:
                  "Free standard shipping on all orders over ₹25,000. Delivered within 5-7 business days with real-time tracking.",
              },
              {
                id: "returns",
                title: "Returns & Warranty",
                icon: <RotateCcw size={18} />,
                content:
                  "30-day hassle-free returns and a 2-year comprehensive warranty on all structural components.",
              },
            ].map((item) => (
              <div key={item.id} className="bg-surface">
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 hover:bg-muted/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-secondary">{item.icon}</span>
                    <span className="text-[13px] font-black uppercase tracking-[1px]">
                      {item.title}
                    </span>
                  </div>
                  {openAccordion === item.id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                <AnimatePresence>
                  {openAccordion === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-[0_20px_20px_52px] text-[14px] text-muted font-medium leading-relaxed">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-24">
        <div className="flex border-b border-border mb-10 overflow-x-auto no-scrollbar">
          {["overview", "specifications", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-[11px] font-black uppercase tracking-[2px] transition-all relative whitespace-nowrap ${activeTab === tab ? "text-secondary" : "text-muted hover:text-foreground"}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-[42px] font-black leading-[1.1]">
                  Crafted for Modern Living
                </h2>
                <p className="text-muted font-bold text-lg leading-relaxed">
                  Our {currentProduct.name} is more than just a piece of
                  furniture; it's a statement of style and a commitment to
                  quality. Every detail has been carefully considered to provide
                  you with the best possible experience.
                </p>
                <ul className="space-y-4">
                  {[
                    "Premium Quality Materials",
                    "Ergonomic Design",
                    "Expert Craftsmanship",
                    "Easy Assembly",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 font-bold text-foreground/80"
                    >
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[32px] overflow-hidden aspect-video border border-border">
                <img
                  src={galleryImages[1] || primaryImage}
                  alt="Detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Basic Product Info */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[2px] text-secondary mb-4">
                  Product Information
                </h3>
                {[
                  { label: "Product Type", value: currentProduct.type },
                  { label: "SKU", value: currentProduct.sku },
                  { label: "Status", value: currentProduct.status },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between p-4 border-b border-border/50"
                  >
                    <span className="text-[11px] font-black uppercase tracking-[2px] text-muted">
                      {spec.label}
                    </span>
                    <span className="font-bold capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Grouped Options by Attribute Set */}
              {Object.keys(groupedOptions).map((attributeSetId) => (
                <div key={attributeSetId} className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[2px] text-secondary mb-4">
                    {attributeSetId
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </h3>
                  {groupedOptions[attributeSetId].map((option: any) => (
                    <div
                      key={option.key}
                      className="flex justify-between p-4 border-b border-border/50"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[2px] text-muted">
                        {option.label}
                      </span>
                      <span className="font-bold capitalize">
                        {option.selectedValues.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
              <div className="space-y-6">
                <div className="p-8 rounded-3xl border border-border bg-surface text-center space-y-2">
                  <div className="text-[64px] font-black leading-none">4.8</div>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < 4
                            ? "text-secondary fill-secondary"
                            : "text-border"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-muted">
                    Based on customer reviews
                  </p>
                </div>
                <button className="w-full h-14 rounded-full border border-secondary text-secondary font-black text-xs uppercase tracking-[2px] hover:bg-secondary hover:text-white transition-all">
                  Write a Review
                </button>
              </div>
              <div className="space-y-8">
                <div className="text-center text-muted font-bold py-12">
                  No reviews yet. Be the first to review this product!
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products - You can fetch these based on relatedProductIds */}
      {currentProduct.relatedProductIds?.length > 0 && (
        <section className="mt-32">
          <div className="flex justify-between items-end mb-10">
            <div>
              <small className="text-secondary tracking-[3px] uppercase text-[10px] font-black mb-2 block">
                Curated for you
              </small>
              <h2 className="text-[42px] font-black leading-[1.1]">
                Related Products
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-[11px] font-black uppercase tracking-[2px] text-secondary border-b border-secondary pb-1 hover:opacity-70 transition-all"
            >
              View All
            </Link>
          </div>
          {/* Add related products grid here */}
        </section>
      )}

      {/* Ask Question Modal */}
      <AnimatePresence>
        {isAskQuestionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg p-6 bg-surface rounded-2xl shadow-xl"
            >
              <button
                onClick={() => setIsAskQuestionOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black mb-6">Ask a Question</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAskQuestionOpen(false); }}>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your name*" required className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none focus:border-secondary" />
                  <input type="text" placeholder="Your phone number" className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none focus:border-secondary" />
                </div>
                <input type="email" placeholder="Your email*" required className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none focus:border-secondary" />
                <textarea placeholder="Your message*" required rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none focus:border-secondary resize-none"></textarea>
                <p className="text-sm text-muted">* Required fields cannot be left blank.</p>
                <button type="submit" className="w-full py-4 rounded-xl bg-black text-white font-black hover:bg-black/90 transition-colors">
                  Send Your Message
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm p-6 bg-surface rounded-2xl shadow-xl"
            >
              <button
                onClick={() => setIsShareOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black mb-6">Copy Link</h3>
              
              <div className="flex gap-2 mb-6">
                <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="flex-1 px-4 py-3 rounded-xl border border-border bg-transparent outline-none text-muted" />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-black text-white hover:bg-black/90 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>

              <div>
                <p className="font-bold mb-3">Share:</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="w-12 h-12 cursor-pointer rounded-full border border-border flex items-center justify-center hover:border-black hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <FacebookIcon size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      const url = window.location.href;
                      const title = currentProduct?.name || 'Check out this product!';
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                    }}
                    className="w-12 h-12 cursor-pointer rounded-full border border-border flex items-center justify-center hover:border-black hover:bg-sky-50 hover:text-sky-500 transition-colors"
                  >
                    <TwitterIcon size={18} />
                  </button>
                  <button 
                    onClick={async () => {
                      const url = window.location.href;
                      const title = currentProduct?.name || 'Check out this product!';
                      if (navigator.share) {
                        try {
                          await navigator.share({ title, url });
                        } catch (err) {}
                      } else {
                        navigator.clipboard.writeText(url);
                      }
                    }}
                    className="w-12 h-12 cursor-pointer rounded-full border border-border flex items-center justify-center hover:border-black hover:bg-gray-100 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CartSidebar isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
    </div>
  );
};

export default ProductDetailPage;
