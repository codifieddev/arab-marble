"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Plus, X, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface MediaGalleryItem {
  id: string;
  url: string;
  alt: string;
}

interface MediaMatrixProps {
  images: MediaGalleryItem[];
  onChange: (images: MediaGalleryItem[]) => void;
  primaryImageId?: string;
  onSetPrimary?: (id: string) => void;
}

export function MediaMatrix({ images, onChange, primaryImageId, onSetPrimary }: MediaMatrixProps) {
  const [urlDraft, setUrlDraft] = useState("");
  const [altDraft, setAltDraft] = useState("");

  const addImage = () => {
    const trimmed = urlDraft.trim();
    if (trimmed) {
      const id = `img_${Date.now()}`;
      onChange([...images, { id, url: trimmed, alt: altDraft.trim() }]);
      setUrlDraft("");
      setAltDraft("");
    }
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateAlt = (id: string, alt: string) => {
    onChange(images.map((img) => img.id === id ? { ...img, alt } : img));
  };

  return (
    <Card className=" border-border bg-card relative overflow-hidden group">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-primary italic mb-2">
          <Plus size={14} />
          Asset_Orchestration // Media
        </div>
        <CardTitle className="font-sans text-2xl font-bold tracking-tight">Media Matrix</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Label htmlFor="image-url" className="sr-only">Image URL</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.png"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="h-12 bg-card border-border focus-visible:ring-cyan-500/20 rounded-xl font-medium text-sm"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            />
          </div>
          <Button 
            type="button" 
            onClick={addImage}
            disabled={!urlDraft.trim()}
            className="h-12 px-6 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            Inject_Asset
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((item, idx) => (
            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-inner group/asset">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.url} 
                alt={item.alt || `Asset_${idx}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover/asset:scale-110"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = "https://placehold.co/400x400/020617/0ea5e9?text=invalid_payload";
                }}
              />
              <div className="absolute inset-0 bg-card opacity-0 group-hover/asset:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <div className="flex gap-2">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 text-foreground transition-colors">
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="p-2 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary-light transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Node::{idx.toString().padStart(2, '0')}</span>
              </div>
              <div className="absolute top-2 left-2 pointer-events-none">
                 <Badge className="bg-card backdrop-blur-md border-border text-[9px] uppercase tracking-tighter px-2 h-5 font-black">IMG_{idx + 1}</Badge>
              </div>
            </div>
          ))}
          
          {images.length === 0 && (
             <div className="col-span-full border border-dashed border-border rounded-2xl aspect-[4/1] flex flex-col items-center justify-center space-y-2 bg-background/[0.02]">
                <ImageIcon size={24} className="text-slate-600 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Awaiting_Media_Payload</span>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
