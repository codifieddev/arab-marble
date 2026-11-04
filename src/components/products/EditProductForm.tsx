"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  PlusCircle, 
  DollarSign, 
  Activity, 
  Layers, 
  Tag, 
  Settings, 
  Focus, 
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateVariantsFromOptions } from "@/lib/commerce";
import { MediaMatrix } from "@/components/MediaMatrix";
import { VariantArchitect } from "@/components/VariantArchitect";
import { Badge } from "../ui/badge";

type EditProductFormProps = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  type?: string;
  status: string;
  description: string;
  detailsTabs?: Array<{ key?: string; label?: string; content?: string }>;
  price?: number;
  compareAtPrice?: number;
  costPerItem?: number;
  chargeTax?: boolean;
  trackQuantity?: boolean;
  gallery?: any[];
  primaryImageId?: string;
  primaryCategoryId?: string;
  categoryIds?: string[];
  attributeSetIds?: string[];
  relatedProductIds?: string[];
  templateKey?: string;
  options?: any[];
  variants?: any[];
};

function getDetailsTabContent(
  tabs: EditProductFormProps["detailsTabs"],
  keys: string[],
) {
  return tabs?.find((tab) => tab.key && keys.includes(tab.key))?.content || "";
}

export function EditProductForm(props: EditProductFormProps) {
  const [name, setName] = useState(props.name);
  const [slug, setSlug] = useState(props.slug);
  const [sku, setSku] = useState(props.sku || "");
  const [type, setType] = useState(props.type || "physical");
  const [statusValue, setStatusValue] = useState(props.status);
  const [description, setDescription] = useState(props.description);
  const [descriptionTab, setDescriptionTab] = useState(
    getDetailsTabContent(props.detailsTabs, ["description"]),
  );
  const [shippingReturnsTab, setShippingReturnsTab] = useState(
    getDetailsTabContent(props.detailsTabs, ["shipping-returns", "shipping"]),
  );
  const [price, setPrice] = useState(props.price?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(props.compareAtPrice?.toString() || "");
  const [costPerItem, setCostPerItem] = useState(props.costPerItem?.toString() || "");
  const [chargeTax, setChargeTax] = useState(props.chargeTax ?? true);
  const [trackQuantity, setTrackQuantity] = useState(props.trackQuantity ?? true);
  const [images, setImages] = useState<any[]>(props.gallery || []);
  const [primaryImageId, setPrimaryImageId] = useState(props.primaryImageId || "");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(props.primaryCategoryId || "");
  const [categoryIds, setCategoryIds] = useState<string[]>(props.categoryIds || []);
  const [attributeSetIds, setAttributeSetIds] = useState<string[]>(props.attributeSetIds || []);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(props.relatedProductIds || []);
  const [templateKey, setTemplateKey] = useState(props.templateKey || "product-split");
  
  // Reconstruct options from variants if any
  const initialOptions = () => {
    if (!props.variants || props.variants.length === 0) return [];
    const first = props.variants[0].options || props.variants[0].optionValues;
    if (!first) return [];
    return Object.keys(first).map(label => ({
       label,
       values: Array.from(new Set(props.variants?.map(v => (v.options || v.optionValues)[label])))
    }));
  };

  const [options, setOptions] = useState<any[]>(initialOptions());
  const [variants, setVariants] = useState<any[]>(props.variants || []);
  const [state, setState] = useState("");
  const [attributeSets, setAttributeSets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/commerce/attribute-sets")
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setAttributeSets(data.items);
        } else if (Array.isArray(data)) {
          setAttributeSets(data);
        }
      })
      .catch(err => console.error("Failed to fetch attribute sets", err));
  }, []);

  const toggleAttributeSet = (setId: string) => {
    const set = attributeSets.find(s => s.id === setId || s._id === setId || s.key === setId);
    if (!set) return;

    if (attributeSetIds.includes(setId)) {
      setAttributeSetIds(prev => prev.filter(id => id !== setId));
      const nextOptions = options.filter(opt => opt.attributeSetId !== setId);
      setOptions(nextOptions);
      setVariants(generateVariantsFromOptions(nextOptions, variants, slug, price ? Number(price) : 0));
    } else {
      setAttributeSetIds(prev => [...prev, setId]);
      const newOptions = (set.attributes || []).map((attr: any) => ({
        key: attr.key || attr.label,
        label: attr.label || attr.key,
        values: attr.options || [],
        useForVariants: true,
        attributeSetId: setId
      }));
      const nextOptions = [...options, ...newOptions];
      setOptions(nextOptions);
      setVariants(generateVariantsFromOptions(nextOptions, variants, slug, price ? Number(price) : 0));
    }
  };

  async function handleSave() {
    setState("Saving...");
    const payload = {
      id: props.id,
      name,
      slug,
      sku,
      type,
      status: statusValue,
      description,
      detailsTabs: [
        { key: "description", label: "Description", content: descriptionTab },
        { key: "shipping-returns", label: "Shipping & Returns", content: shippingReturnsTab },
      ],
      pricing: {
        price: price ? Number(price) : undefined,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        costPerItem: costPerItem ? Number(costPerItem) : undefined,
        chargeTax,
        trackQuantity
      },
      price: price ? Number(price) : undefined,
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
      cost_per_item: costPerItem ? Number(costPerItem) : undefined,
      charge_tax: chargeTax,
      track_quantity: trackQuantity,
      gallery: images,
      primary_image_id: primaryImageId,
      primary_category_id: primaryCategoryId,
      category_ids: categoryIds,
      categoryIds,
      attributeSetIds,
      related_product_ids: relatedProductIds,
      template_key: templateKey,
      options,
      variants,
    };
    const res = await fetch(`/api/commerce/products/${props.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setState(payload?.error || "Save failed.");
      return;
    }
    setState("Saved.");
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Card className=" border-border bg-card relative group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-primary italic mb-2">
                  <Activity size={14} className="text-primary" />
                  Identity_Manifest // EDIT
               </div>
               <CardTitle className="font-sans text-2xl font-bold tracking-tight">Product Architecture</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-name" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Manifest_Title</Label>
                  <Input
                    id="product-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Quantum_Processor_X1"
                    className="h-12 bg-card border-border focus-visible:ring-primary/20 rounded-xl font-bold text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-sku" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Node_SKU</Label>
                  <Input
                    id="product-sku"
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    placeholder="SKU-001"
                    className="h-12 bg-card border-border focus-visible:ring-primary/20 rounded-xl font-mono text-sm uppercase"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-slug" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Routing_Handle</Label>
                  <Input
                    id="product-slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="e.g. quantum-x1"
                    className="h-12 bg-card border-border focus-visible:ring-primary/20 rounded-xl font-bold text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-type" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Entity_Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="product-type" className="h-12 bg-card border-border focus:ring-primary/20 rounded-xl font-bold text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl">
                      <SelectItem value="physical" className="font-bold text-xs uppercase tracking-widest">PHYSICAL</SelectItem>
                      <SelectItem value="digital" className="font-bold text-xs uppercase tracking-widest text-primary">DIGITAL</SelectItem>
                      <SelectItem value="service" className="font-bold text-xs uppercase tracking-widest text-purple-400">SERVICE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-status" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Lifecycle_State</Label>
                <Select value={statusValue} onValueChange={setStatusValue}>
                  <SelectTrigger id="product-status" className="h-12 bg-card border-border focus:ring-primary/20 rounded-xl font-bold text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl">
                    <SelectItem value="draft" className="font-bold text-xs uppercase tracking-widest">DRAFT</SelectItem>
                    <SelectItem value="published" className="font-bold text-xs uppercase tracking-widest text-primary">PUBLISHED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-border bg-card relative overflow-hidden group">
            <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400 italic mb-2">
                  <DollarSign size={14} />
                  Financial_Telemetry
               </div>
               <CardTitle className="font-sans text-2xl font-bold tracking-tight">Price Manifest</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="product-price" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Unit_Valuation</Label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50" />
                        <Input
                            id="product-price"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="0.00"
                            className="h-12 pl-10 bg-card border-border focus-visible:ring-emerald-500/20 rounded-xl font-bold text-sm text-emerald-400"
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="product-compare-at" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Compare_At</Label>
                    <div className="relative">
                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                        <Input
                            id="product-compare-at"
                            value={compareAtPrice}
                            onChange={(event) => setCompareAtPrice(event.target.value)}
                            placeholder="0.00"
                            className="h-12 pl-10 bg-card border-border focus-visible:ring-slate-500/20 rounded-xl font-bold text-sm text-muted-foreground/80 line-through"
                        />
                    </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="grid gap-2">
                    <Label htmlFor="product-cost" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Cost_Per_Item</Label>
                    <div className="relative">
                        <Activity size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50" />
                        <Input
                            id="product-cost"
                            value={costPerItem}
                            onChange={(event) => setCostPerItem(event.target.value)}
                            placeholder="0.00"
                            className="h-12 pl-10 bg-card border-border focus-visible:ring-cyan-500/20 rounded-xl font-bold text-sm text-primary"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-background/[0.02] border border-border">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Tax_Protocol</span>
                        <div className="flex items-center gap-2" onClick={() => setChargeTax(!chargeTax)}>
                            <div className={cn("w-8 h-4 rounded-full relative transition-colors cursor-pointer", chargeTax ? "bg-secondary/40" : "bg-muted/50")}>
                                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all", chargeTax ? "left-4.5" : "left-0.5")} />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{chargeTax ? "TAX_ACTIVE" : "EXEMPT"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-border pl-6">
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Stock_Audit</span>
                        <div className="flex items-center gap-2" onClick={() => setTrackQuantity(!trackQuantity)}>
                            <div className={cn("w-8 h-4 rounded-full relative transition-colors cursor-pointer", trackQuantity ? "bg-primary/40" : "bg-muted/50")}>
                                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all", trackQuantity ? "left-4.5" : "left-0.5")} />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{trackQuantity ? "LIVE" : "UNTRACKED"}</span>
                        </div>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <MediaMatrix 
            images={images} 
            onChange={setImages} 
            primaryImageId={primaryImageId}
            onSetPrimary={setPrimaryImageId}
          />

          <Card className=" border-border bg-card relative overflow-hidden group">
            <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-primary italic mb-2">
                  <Focus size={14} />
                  Node_Configuration
               </div>
               <CardTitle className="font-sans text-2xl font-bold tracking-tight">System Presets</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="product-template" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">UI_Template</Label>
                <Select value={templateKey} onValueChange={setTemplateKey}>
                  <SelectTrigger id="product-template" className="h-12 bg-card border-border focus:ring-cyan-500/20 rounded-xl font-bold text-sm">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl">
                    <SelectItem value="product-split" className="font-bold text-xs uppercase tracking-widest">SPLIT_VIEW</SelectItem>
                    <SelectItem value="product-full" className="font-bold text-xs uppercase tracking-widest">CINEMATIC_FULL</SelectItem>
                    <SelectItem value="product-minimal" className="font-bold text-xs uppercase tracking-widest">MINIMALIST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className=" border-border bg-card relative overflow-hidden group">
            <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-purple-400 italic mb-2">
                  <Box size={14} />
                  Organization_Matrix
               </div>
               <CardTitle className="font-sans text-2xl font-bold tracking-tight">Node Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid gap-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Primary_Catalog</Label>
                    <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
                        <SelectTrigger className="h-12 bg-card border-border focus:ring-purple-500/20 rounded-xl font-bold text-sm">
                            <SelectValue placeholder="Main Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl">
                            <SelectItem value="cat_electronics" className="font-bold text-xs uppercase tracking-widest">ELECTRONICS</SelectItem>
                            <SelectItem value="cat_apparel" className="font-bold text-xs uppercase tracking-widest">APPAREL</SelectItem>
                            <SelectItem value="cat_software" className="font-bold text-xs uppercase tracking-widest">SOFTWARE</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Attribute_Protocol</Label>
                    <div className="flex flex-wrap gap-2">
                        {attributeSets.map(set => (
                            <Badge 
                                key={set.id || set._id}
                                variant="outline"
                                onClick={() => toggleAttributeSet(set.id || set._id || set.key)}
                                className={cn(
                                    "px-4 py-2 rounded-xl cursor-pointer border-border transition-all text-[10px] font-black uppercase tracking-widest",
                                    attributeSetIds.includes(set.id || set._id || set.key) ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-background/5 text-muted-foreground hover:text-muted-foreground"
                                )}
                            >
                                {set.name || set.label}
                            </Badge>
                        ))}
                        {attributeSets.length === 0 && (
                            <span className="text-[10px] text-slate-600 italic">No attribute sets initialized...</span>
                        )}
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card className=" border-border bg-card h-full relative overflow-hidden group">
            <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-primary italic mb-2">
                  <Sparkles size={14} />
                  Content_Layer
               </div>
               <CardTitle className="font-sans text-2xl font-bold tracking-tight">Description Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="product-edit-description" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Technical_Brief</Label>
                <Textarea
                  id="product-edit-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-[220px] bg-card border-border focus-visible:ring-cyan-500/20 rounded-2xl font-medium text-sm leading-relaxed"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-edit-description-tab" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Product Description Tab</Label>
                  <Textarea
                    id="product-edit-description-tab"
                    value={descriptionTab}
                    onChange={(event) => setDescriptionTab(event.target.value)}
                    placeholder="Content shown inside the Description tab..."
                    className="min-h-[150px] bg-card border-border focus-visible:ring-cyan-500/20 rounded-2xl font-medium text-sm leading-relaxed"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-edit-shipping-returns-tab" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Shipping & Returns Tab</Label>
                  <Textarea
                    id="product-edit-shipping-returns-tab"
                    value={shippingReturnsTab}
                    onChange={(event) => setShippingReturnsTab(event.target.value)}
                    placeholder="Shipping and return policy shown in the tab..."
                    className="min-h-[150px] bg-card border-border focus-visible:ring-cyan-500/20 rounded-2xl font-medium text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4 border-t border-border pt-8">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic">Node Status</span>
                  <span className="text-xs font-bold text-muted-foreground">Awaiting_Update</span>
                </div>
                <div className="flex items-center gap-4">
                    {state && (
                      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border-border bg-background/5">
                        {state}
                      </Badge>
                    )}
                    <Button type="button" onClick={handleSave} className="h-12 px-10 font-bold shadow-glow hover:scale-[1.05] transition-all rounded-xl text-primary-foreground bg-primary hover:bg-primary/90">
                      Sync Node
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <VariantArchitect 
            options={options} 
            variants={variants} 
            gallery={images}
            basePrice={price ? Number(price) : 0} 
            baseSku={slug}
            onChange={(o, v) => { setOptions(o); setVariants(v); }} 
          />
        </div>
      </div>
    </div>

  );
}
