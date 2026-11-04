"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Layers, Boxes, Trash2, Hash, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductOption, VariantRow, GalleryItem, generateVariantsFromOptions } from "@/lib/commerce";

interface VariantArchitectProps {
  options: ProductOption[];
  variants: VariantRow[];
  gallery: GalleryItem[];
  basePrice: number;
  baseSku: string;
  onChange: (options: ProductOption[], variants: VariantRow[]) => void;
}

export function VariantArchitect({ options, variants, gallery, basePrice, baseSku, onChange }: VariantArchitectProps) {
  const [optionLabel, setOptionLabel] = useState("");
  const [optionValues, setOptionValues] = useState("");

  const addOption = () => {
    if (optionLabel.trim() && optionValues.trim()) {
      const newOption: ProductOption = {
        label: optionLabel.trim(),
        values: optionValues.split(",").map(v => v.trim()).filter(Boolean),
        useForVariants: true
      };
      const nextOptions = [...options, newOption];
      onChange(nextOptions, generateVariantsFromOptions(nextOptions, variants, baseSku, basePrice));
      setOptionLabel("");
      setOptionValues("");
    }
  };

  const removeOption = (index: number) => {
    const nextOptions = options.filter((_, i) => i !== index);
    onChange(nextOptions, generateVariantsFromOptions(nextOptions, variants, baseSku, basePrice));
  };

  const handleManualRegenerate = () => {
     onChange(options, generateVariantsFromOptions(options, variants, baseSku, basePrice));
  };

  const updateVariant = (key: string, patch: Partial<VariantRow>) => {
    onChange(options, variants.map(v => v.key === key ? { ...v, ...patch } : v));
  };

  return (
    <Card className=" border-border bg-card relative overflow-hidden group">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-purple-400 italic mb-1">
            <Layers size={14} />
            Option_Splicer // ARCHITECT
          </div>
          <CardTitle className="font-sans text-2xl font-bold tracking-tight">Variant Architect</CardTitle>
        </div>
        {options.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRegenerate}
            className="h-9 border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 font-bold text-[10px] uppercase tracking-widest gap-2 rounded-xl"
          >
            <Sparkles size={12} /> Sync_Matrix
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-8">
        {/* Option Creation */}
        <div className="space-y-4 p-6 rounded-2xl bg-background/[0.02] border border-border">
           <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Option_Axis (e.g. Size)</Label>
                 <Input 
                   value={optionLabel} 
                   onChange={e => setOptionLabel(e.target.value)}
                   placeholder="Size"
                   className="h-11 bg-card border-border focus-visible:ring-purple-500/20 rounded-xl text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 ml-1">Values (comma separated)</Label>
                 <Input 
                   value={optionValues} 
                   onChange={e => setOptionValues(e.target.value)}
                   placeholder="S, M, L"
                   className="h-11 bg-card border-border focus-visible:ring-purple-500/20 rounded-xl text-sm"
                 />
              </div>
           </div>
           <Button 
             type="button" 
             onClick={addOption}
             disabled={!optionLabel.trim() || !optionValues.trim()}
             className="w-full h-11 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all rounded-xl font-bold uppercase tracking-widest text-[10px]"
           >
             Inject_Axis
           </Button>
        </div>

        {/* Active Options */}
        {options.length > 0 && (
           <div className="flex flex-wrap gap-3">
              {options.map((opt, idx) => (
                 <Badge key={idx} variant="outline" className="h-10 px-4 flex gap-3 bg-background/5 border-border rounded-xl">
                    <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px]">{opt.label}:</span>
                    <span className="text-muted-foreground font-medium text-xs">{opt.values.join(", ")}</span>
                    <button onClick={() => removeOption(idx)} className="text-muted-foreground hover:text-primary-light transition-colors">
                       <X size={14} />
                    </button>
                 </Badge>
              ))}
           </div>
        )}

        {/* Variant Grid */}
        {variants.length > 0 && (
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground italic">
                <Boxes size={14} />
                Combination_Matrix ({variants.length})
              </div>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background/[0.01]">
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Node_Variant</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Asset_Link</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">SKU_ID</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Valuation</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Audit_Stock</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Compare</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {variants.map((variant) => (
                      <tr key={variant.key} className="group/row hover:bg-background/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-200">{variant.title}</span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">KEY: {variant.key}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-2">
                              {variant.imageId && gallery.find(g => g.id === variant.imageId) && (
                                <img 
                                  src={gallery.find(g => g.id === variant.imageId)?.url} 
                                  className="w-8 h-8 rounded border border-border object-cover" 
                                />
                              )}
                              <select 
                                value={variant.imageId || ""} 
                                onChange={e => updateVariant(variant.key, { imageId: e.target.value })}
                                className="h-8 bg-card border border-border text-[10px] rounded px-1 text-muted-foreground focus:outline-none focus:border-purple-500/30"
                              >
                                <option value="">NO_ASSET</option>
                                {gallery.map(g => (
                                  <option key={g.id} value={g.id}>{g.alt || g.id}</option>
                                ))}
                              </select>
                           </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            value={variant.sku} 
                            onChange={e => updateVariant(variant.key, { sku: e.target.value })}
                            className="h-8 bg-card border-border text-[10px] font-mono uppercase w-32"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.price} 
                            onChange={e => updateVariant(variant.key, { price: Number(e.target.value) })}
                            className="h-8 bg-card border-border text-xs font-bold text-purple-400 w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.stock} 
                            onChange={e => updateVariant(variant.key, { stock: Number(e.target.value) })}
                            className="h-8 bg-card border-border text-xs text-muted-foreground w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.compareAtPrice} 
                            onChange={e => updateVariant(variant.key, { compareAtPrice: Number(e.target.value) })}
                            className="h-8 bg-card border-border text-[10px] text-muted-foreground line-through w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={variant.cost} 
                            onChange={e => updateVariant(variant.key, { cost: Number(e.target.value) })}
                            className="h-8 bg-card border-border text-[10px] text-muted-foreground w-20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
