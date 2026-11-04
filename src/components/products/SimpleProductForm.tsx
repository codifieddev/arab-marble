"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X, Plus, Trash2, Upload } from "lucide-react";
import { useAppDispatch } from "@/lib/store/hooks";

export function SimpleProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    price: initialData?.price?.toString() || "",
    status: initialData?.status || "active",
    description: initialData?.description || "",
    primaryImageId: initialData?.primaryImageId || "",
    galleryUrls: initialData?.gallery?.length
      ? [...initialData.gallery, ""]
      : [""],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.galleryUrls];
    newGallery[index] = value;
    setFormData((prev) => ({ ...prev, galleryUrls: newGallery }));
  };

  const addGalleryField = () => {
    setFormData((prev) => ({
      ...prev,
      galleryUrls: [...prev.galleryUrls, ""],
    }));
  };

  const removeGalleryField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isPrimary: boolean,
    index?: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/ecommerce/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (isPrimary) {
        handleInputChange("primaryImageId", data.url);
      } else if (index !== undefined) {
        handleGalleryChange(index, data.url);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: formData.name,
      sku: formData.sku,
      price: Number(formData.price),
      status: formData.status,
      description: formData.description,
      primaryImageId: formData.primaryImageId,
      gallery: formData.galleryUrls.filter((url) => url.trim() !== ""),
      pricing: {
        price: Number(formData.price),
        currency: "INR",
      },
      ...(!isEdit && { createdAt: new Date() }),
      updatedAt: new Date(),
    };

    try {
      const endpoint = isEdit
        ? `/api/commerce/products/${initialData._id}`
        : "/api/commerce/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...initialData, ...payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create product");
      }
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-xl font-bold">
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product title..."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU Code</Label>
                    <Input
                      id="sku"
                      placeholder="e.g., FUR-101"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      required
                      className="h-11 font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="resize-none leading-relaxed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-xl font-bold">
                Media & Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryImage">Thumbnail URL (Primary)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryImage"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.primaryImageId}
                      onChange={(e) =>
                        handleInputChange("primaryImageId", e.target.value)
                      }
                      className="h-11 flex-1"
                    />
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 px-4 text-xs tracking-wider uppercase font-semibold gap-2 border-border"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}{" "}
                        Upload
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => handleFileUpload(e, true)}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Gallery Images</Label>
                  {formData.galleryUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex gap-2 group animate-in fade-in slide-in-from-left-1"
                    >
                      <Input
                        placeholder="Additional image URL..."
                        value={url}
                        onChange={(e) =>
                          handleGalleryChange(index, e.target.value)
                        }
                        className="h-11 flex-1"
                      />
                      <div className="relative shrink-0">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-11 w-11"
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => handleFileUpload(e, false, index)}
                          disabled={uploading}
                        />
                      </div>
                      {formData.galleryUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGalleryField(index)}
                          className="h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs font-semibold gap-2 border-dashed"
                    onClick={addGalleryField}
                  >
                    <Plus className="h-3 w-3" /> Add Gallery URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Publishing Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleInputChange("status", val)}
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Visible)</SelectItem>
                      <SelectItem value="draft">Draft (Hidden)</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-bold text-base gap-2 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />{" "}
                      {isEdit ? "Update Product" : "Save Product"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-xl"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
