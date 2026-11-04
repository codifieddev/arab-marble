"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, ShoppingBag, Star, SlidersHorizontal } from "lucide-react";
import { getV } from "@/lib/cmsUtils";
import { defaultProductGridData } from "./productGridData";

interface ProductGridProps {
  section?: {
    props?: any;
    content?: any[];
  };
}

const ProductGrid: React.FC<ProductGridProps> = ({ section }) => {
  const pathname = usePathname();
  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const props = section?.props || defaultProductGridData.props;
  const rawProducts = section?.content || defaultProductGridData.content;

  const badge = getV(props.badge, lang);
  const title = getV(props.title, lang);
  
  // Filter Options
  const categories = props.filterOptions?.categories || defaultProductGridData.props.filterOptions.categories;
  const sortOptions = props.filterOptions?.sorting || defaultProductGridData.props.filterOptions.sorting;

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("featured");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Parse Products
  const products = useMemo(() => {
    return rawProducts.map((p: any) => ({
      id: p.id,
      title: getV(p.props.title, lang),
      category: getV(p.props.category, lang),
      price: p.props.price?.value || p.props.price || 0,
      oldPrice: p.props.oldPrice?.value || p.props.oldPrice || null,
      rating: p.props.rating?.value || p.props.rating || 0,
      tags: (p.props.tags?.value || p.props.tags || []).map((t: any) => getV(t, lang)),
      image: p.props.image?.value || p.props.image || "/assets/Image/Sofa.jpg",
      ctaButton: getV(p.props.ctaButton, lang),
      link: getV(p.props.link, lang) || "#",
    }));
  }, [rawProducts, lang]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }

    // Category
    if (activeCategory !== "All" && activeCategory !== "सभी") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Price
    result = result.filter(p => p.price <= maxPrice);

    // Sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // 'featured' keeps original array order (CMS defined)
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, maxPrice, sortBy]);

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            {badge && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-foreground/80">{badge}</span>
              </div>
            )}
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{title}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input 
                type="text" 
                placeholder="Search furniture..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full min-w-[240px] rounded-full border border-border bg-surface pl-10 pr-4 text-sm font-medium text-foreground outline-none focus:border-secondary transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden h-12 px-4 flex items-center gap-2 rounded-full border border-border bg-surface text-sm font-bold text-foreground"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-[260px] shrink-0 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
             <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                
                {/* Categories */}
                <div className="mb-8">
                  <h4 className="font-heading text-xl font-bold text-foreground mb-4">Categories</h4>
                  <div className="flex flex-col gap-2.5">
                    {categories.map((cat: any, i: number) => {
                      const name = getV(cat, lang);
                      const isActive = activeCategory === name;
                      return (
                        <button 
                          key={i}
                          onClick={() => setActiveCategory(name)}
                          className={`flex items-center justify-between text-sm font-medium transition-colors ${isActive ? 'text-secondary' : 'text-foreground/70 hover:text-foreground'}`}
                        >
                          {name}
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="font-heading text-xl font-bold text-foreground">Price</h4>
                    <span className="text-xs font-bold text-foreground/60">Up to ₹{maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-secondary"
                  />
                </div>

                {/* Sorting */}
                <div>
                  <h4 className="font-heading text-xl font-bold text-foreground mb-4">Sort By</h4>
                  <div className="flex flex-col gap-2.5">
                    {sortOptions.map((sort: any, i: number) => {
                      const label = getV(sort.label, lang);
                      return (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortBy === sort.value ? 'border-secondary' : 'border-border group-hover:border-foreground/50'}`}>
                              {sortBy === sort.value && <div className="w-2 h-2 rounded-full bg-secondary" />}
                           </div>
                           <input 
                             type="radio" 
                             name="sort" 
                             value={sort.value}
                             checked={sortBy === sort.value}
                             onChange={(e) => setSortBy(e.target.value)}
                             className="hidden"
                           />
                           <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

             </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm font-bold text-foreground/50 uppercase tracking-wider">
                Showing {filteredProducts.length} Results
              </p>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={product.id}
                    className="product-card group"
                  >
                    {/* Tags / Badges */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-2">
                        {product.tags.map((tag: string, i: number) => (
                          <span key={i} className="badge relative top-0 left-0">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/65 backdrop-blur-md border border-border text-foreground/60 transition-colors hover:text-red-500 hover:border-red-500/30">
                      <Heart size={16} />
                    </button>

                    {/* Image */}
                    <div className="img-wrap">
                      <img src={product.image} alt={product.title} />
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[1.5px] text-foreground/50 mb-1">
                            {product.category}
                          </p>
                          <h3 className="font-heading text-[22px] font-bold text-foreground leading-tight">
                            {product.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-md border border-border/50">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[11px] font-bold text-foreground">{product.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                        {product.oldPrice && (
                          <span className="text-sm font-medium text-foreground/40 line-through">₹{product.oldPrice}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                         <a href={product.link} className="text-[11px] font-black uppercase tracking-[1.5px] text-foreground hover:text-secondary transition-colors">
                            View Details
                         </a>
                         <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-black transition-transform hover:scale-105 shadow-sm">
                           <ShoppingBag size={14} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="font-heading text-2xl text-foreground/60">No products found matching your criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setActiveCategory("All"); setMaxPrice(5000); }}
                    className="mt-4 px-6 py-2 rounded-full border border-border text-sm font-bold text-foreground hover:bg-surface"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
