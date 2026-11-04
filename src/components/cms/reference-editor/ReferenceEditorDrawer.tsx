'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Package, MessageSquare, Heart, FileText, Check, Loader2, Sparkles, Building2 } from 'lucide-react';
import { useReferenceEditor, ReferenceItemType } from './ReferenceEditorContext';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updateLocalProduct, saveProduct } from '@/lib/store/products/productsSlices';
import { updateSectionItem, updatePageField } from '@/lib/store/pages/pagesSlice';
import { updatePageThunk } from '@/lib/store/pages/pageThunk';
import { toast } from 'sonner';
import CanvasProductForm from './CanvasProductForm';
import CanvasFormModal from './CanvasFormModal';
import CanvasProjectModal from './CanvasProjectModal';

export default function ReferenceEditorDrawer() {
  const {
    isOpen,
    type,
    title,
    itemData,
    sectionId,
    itemIndex,
    closeReferenceEditor,
    customSaveHandler,
  } = useReferenceEditor();

  const dispatch = useAppDispatch();
  const allCategories = useAppSelector(
    (state) => state.categories?.allCategories || (state as any).adminCategories?.allCategories || []
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hydratedProduct, setHydratedProduct] = useState<any>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Hydrate full commerce product with raw options & variants if type === 'product'
  useEffect(() => {
    if (!isOpen || type !== 'product' || !itemData) {
      setHydratedProduct(null);
      return;
    }

    let isMounted = true;
    const fetchFullProduct = async () => {
      const slug = itemData.slug || itemData.productSlug || null;
      const id = itemData.id || itemData._id || itemData.productId || null;

      if (!slug && !id) {
        setHydratedProduct(itemData);
        return;
      }

      if (
        Array.isArray(itemData.variants) &&
        itemData.variants.length > 5 &&
        Array.isArray(itemData.options) &&
        itemData.options.length > 0 &&
        itemData.name &&
        itemData.type === 'variant'
      ) {
        setHydratedProduct(itemData);
        return;
      }

      setIsLoadingProduct(true);
      try {
        const endpoint = id
          ? `/api/commerce/products/${encodeURIComponent(id)}`
          : `/api/commerce/products/slug/${encodeURIComponent(slug!)}`;

        const res = await fetch(endpoint, { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const prod = json?.data || json;
          if (isMounted && prod) {
            setHydratedProduct(prod);
          }
        } else {
          if (isMounted) setHydratedProduct(itemData);
        }
      } catch (err) {
        console.warn('[ReferenceEditorDrawer] Failed to fetch full product:', err);
        if (isMounted) setHydratedProduct(itemData);
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    };

    fetchFullProduct();
    return () => {
      isMounted = false;
    };
  }, [isOpen, type, itemData]);

  // Initialize form fields when itemData changes
  useEffect(() => {
    if (!itemData) {
      setFormData({});
      return;
    }

    const p = itemData.props || itemData;
    const getRaw = (val: any) => (val && typeof val === 'object' && 'value' in val ? val.value : val);
    const getLang = (val: any) => {
      const v = getRaw(val);
      if (v && typeof v === 'object') return v.en || v.hi || Object.values(v)[0] || '';
      return v ?? '';
    };

    if (type === 'product') {
      const pricing = p.pricing || {};
      setFormData({
        id: itemData.id || itemData._id || p.id || p._id || '',
        name: getLang(p.name || p.title || itemData.name || itemData.title),
        price: getRaw(pricing.price ?? p.price ?? itemData.price ?? ''),
        compareAtPrice: getRaw(pricing.compareAtPrice ?? p.compareAtPrice ?? itemData.compareAtPrice ?? ''),
        sku: getRaw(p.sku ?? itemData.sku ?? ''),
        category: getLang(p.category ?? itemData.category ?? p.categoryName ?? ''),
        description: getLang(p.description ?? itemData.description ?? ''),
        image: getRaw(p.image ?? itemData.image ?? p.imageUrl ?? itemData.imageUrl ?? itemData.gallery?.[0]?.url ?? ''),
        status: p.status || itemData.status || 'active',
        badge: getLang(p.badge ?? itemData.badge ?? ''),
      });
    } else if (type === 'testimonial') {
      setFormData({
        id: itemData.id || itemData._id || '',
        author: getLang(p.author ?? p.name ?? itemData.author ?? itemData.name ?? ''),
        role: getLang(p.role ?? itemData.role ?? ''),
        quote: getLang(p.quote ?? p.text ?? itemData.quote ?? itemData.text ?? ''),
        rating: Number(getRaw(p.rating ?? itemData.rating ?? 5)),
        avatar: getRaw(p.avatar ?? p.image ?? itemData.avatar ?? itemData.image ?? ''),
      });
    } else if (type === 'review') {
      setFormData({
        id: itemData.id || itemData._id || '',
        author: getRaw(itemData.author || itemData.reviewerName || itemData.name || 'Pet Parent'),
        title: getRaw(itemData.title || itemData.headline || ''),
        content: getRaw(itemData.content || itemData.comment || itemData.review || itemData.quote || itemData.text || ''),
        rating: Number(itemData.rating ?? itemData.stars ?? 5),
        verified: Boolean(itemData.verified ?? itemData.isVerified ?? true),
      });
    } else if (type === 'form') {
      setFormData({
        id: itemData.id || itemData._id || '',
        title: getLang(p.title ?? p.heading ?? p.formHeading ?? itemData.title ?? itemData.heading ?? ''),
        description: getLang(p.description ?? p.subheading ?? p.formDescription ?? itemData.description ?? itemData.subheading ?? ''),
        buttonLabel: getLang(p.buttonLabel ?? p.buttonText ?? p.submitButtonText ?? itemData.buttonLabel ?? itemData.buttonText ?? 'Submit'),
        successMessage: getLang(p.successMessage ?? itemData.successMessage ?? 'Thank you!'),
      });
    }
  }, [itemData, type]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeReferenceEditor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeReferenceEditor]);

  if (!isOpen || !type) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const mappedData = {
        ...formData,
        name: formData.author || formData.name || formData.title,
        author: formData.author || formData.name,
        quote: formData.quote || formData.content,
        text: formData.quote || formData.content,
        content: formData.quote || formData.content,
        review: formData.quote || formData.content,
        stars: formData.rating,
        rating: formData.rating,
        title: formData.title || formData.heading,
        heading: formData.title,
        description: formData.description,
        subheading: formData.description,
        buttonText: formData.buttonLabel,
        submitButtonText: formData.buttonLabel,
      };

      if (customSaveHandler) {
        await customSaveHandler(mappedData);
      }

      if (type === 'product') {
        const numPrice = formData.price !== undefined && formData.price !== '' && !isNaN(Number(formData.price))
          ? Number(formData.price)
          : 0;
        const numCompare = formData.compareAtPrice !== undefined && formData.compareAtPrice !== '' && !isNaN(Number(formData.compareAtPrice)) && Number(formData.compareAtPrice) > 0
          ? Number(formData.compareAtPrice)
          : null;

        const updatedProduct = {
          ...itemData,
          ...formData,
          name: formData.name,
          title: formData.name,
          price: numPrice,
          compareAtPrice: numCompare ?? undefined,
          pricing: {
            ...(itemData.pricing || {}),
            price: numPrice,
            compareAtPrice: numCompare,
          },
          image: formData.image,
          description: formData.description,
        };

        // 1. Instantly update in Redux product catalog so it reflects everywhere
        dispatch(updateLocalProduct(updatedProduct));

        // 2. If it is part of a CMS section item (e.g. ProductSlider, ShopByRoom), update section item
        if (sectionId !== undefined && itemIndex !== undefined) {
          dispatch(
            updateSectionItem({
              sectionId,
              itemIndex,
              data: {
                ...formData,
                title: { en: formData.name },
                price: { en: String(formData.price) },
                badge: { en: formData.badge || '' },
              },
            })
          );
        }

        // 3. Persist product if it has an id
        const prodId = formData.id || itemData.id || itemData._id;
        if (prodId) {
          try {
            await dispatch(saveProduct({ data: updatedProduct, editingId: prodId })).unwrap();
          } catch {
            // Keep local state updated even if backend endpoint is unavailable
          }
        }
      } else if (type === 'testimonial') {
        // 1. Update testimonial in current CMS section (Redux)
        if (sectionId !== undefined && itemIndex !== undefined) {
          dispatch(
            updateSectionItem({
              sectionId,
              itemIndex,
              data: {
                author: formData.author,
                name: formData.author,
                role: formData.role,
                quote: formData.quote,
                text: formData.quote,
                rating: Number(formData.rating || 5),
                avatar: formData.avatar,
                image: formData.avatar,
              },
            })
          );
        }

        // 2. Persist to testimonial API endpoint if ID exists
        const testId = formData.id || itemData?.id || itemData?._id;
        if (testId) {
          try {
            await fetch(`/api/cms/testimonials/${encodeURIComponent(testId)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author: formData.author,
                name: formData.author,
                role: formData.role,
                quote: formData.quote,
                text: formData.quote,
                rating: Number(formData.rating || 5),
                avatar: formData.avatar,
              }),
            });
          } catch (err) {
            console.warn('[ReferenceEditorDrawer] Testimonial API save failed:', err);
          }
        }

        // 3. Persist CMS page changes so page draft updates in DB
        try {
          await dispatch(updatePageThunk());
        } catch {
          // Keep local state updated
        }
      } else if (type === 'review') {
        const revId = formData.id || itemData?.id || itemData?._id;
        if (revId) {
          try {
            await fetch(`/api/commerce/reviews/${encodeURIComponent(revId)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: formData.author,
                title: formData.title,
                quote: formData.content,
                text: formData.content,
                rating: Number(formData.rating || 5),
                verified: Boolean(formData.verified),
              }),
            });
          } catch (err) {
            console.warn('[ReferenceEditorDrawer] Review API save failed:', err);
          }
        }

        // If part of section items
        if (sectionId !== undefined && itemIndex !== undefined) {
          dispatch(
            updateSectionItem({
              sectionId,
              itemIndex,
              data: {
                name: formData.author,
                title: formData.title,
                quote: formData.content,
                text: formData.content,
                rating: Number(formData.rating || 5),
                verified: Boolean(formData.verified),
              },
            })
          );
        }

        // Broadcast update so any review cards on the current page update instantly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('peekeeper:review-updated', {
              detail: {
                id: revId,
                name: formData.author,
                title: formData.title,
                quote: formData.content,
                text: formData.content,
                rating: Number(formData.rating || 5),
                verified: Boolean(formData.verified),
              },
            })
          );
        }
      } else if (type === 'form') {
        if (sectionId) {
          dispatch(updatePageField({ sectionId, fieldPath: 'props.heading.en', value: formData.title }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.title.en', value: formData.title }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.formHeading.en', value: formData.title }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.subheading.en', value: formData.description }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.description.en', value: formData.description }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.formDescription.en', value: formData.description }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.submitButtonText.en', value: formData.buttonLabel }));
          dispatch(updatePageField({ sectionId, fieldPath: 'props.buttonText.en', value: formData.buttonLabel }));
          if (formData.successMessage) {
            dispatch(updatePageField({ sectionId, fieldPath: 'props.successMessage.en', value: formData.successMessage }));
          }

          // Persist CMS page changes
          try {
            await dispatch(updatePageThunk());
          } catch {
            // Keep local state updated
          }
        }
      }

      toast.success('Reference updated! Changes reflected immediately.');
      closeReferenceEditor();
    } catch (err: any) {
      console.error('Failed to save reference edit', err);
      toast.error(err.message || 'Could not save reference edit.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (productPayload: any) => {
    setIsSaving(true);
    try {
      if (customSaveHandler) {
        await customSaveHandler(productPayload);
      }

      const normalizedPrice = Number(productPayload.price ?? productPayload.pricing?.price ?? 0);
      const rawCompare = productPayload.compareAtPrice ?? productPayload.pricing?.compareAtPrice;
      const normalizedCompare = rawCompare !== undefined && rawCompare !== '' && !isNaN(Number(rawCompare)) && Number(rawCompare) > 0
        ? Number(rawCompare)
        : null;

      const updatedProduct = {
        ...itemData,
        ...productPayload,
        name: productPayload.name || productPayload.title || itemData.name,
        title: productPayload.name || productPayload.title || itemData.title,
        price: normalizedPrice,
        compareAtPrice: normalizedCompare ?? undefined,
        pricing: {
          ...(itemData.pricing || {}),
          ...(productPayload.pricing || {}),
          price: normalizedPrice,
          compareAtPrice: normalizedCompare,
        },
        description: productPayload.description ?? itemData.description,
        slug: productPayload.slug ?? itemData.slug,
        sku: productPayload.sku ?? itemData.sku,
        image: productPayload.image || productPayload.gallery?.[0]?.url || itemData.image,
      };

      // 1. Dispatch updateLocalProduct so it immediately reflects in storefront Redux
      dispatch(updateLocalProduct(updatedProduct));

      // 2. If it is part of a CMS section item, update section item
      if (sectionId !== undefined && itemIndex !== undefined) {
        dispatch(
          updateSectionItem({
            sectionId,
            itemIndex,
            data: {
              ...productPayload,
              title: { en: updatedProduct.name },
              price: { en: String(updatedProduct.price) },
              badge: { en: productPayload.badge || '' },
            },
          })
        );
      }

      // 3. Persist product to backend API if ID exists
      const prodId = productPayload.id || productPayload._id || itemData?.id || itemData?._id;
      if (prodId) {
        try {
          await dispatch(saveProduct({ data: updatedProduct, editingId: prodId })).unwrap();
        } catch {
          // Keep local state updated
        }
      }

      toast.success('Product updated in catalog! Changes reflected immediately.');
      closeReferenceEditor();
    } catch (err: any) {
      console.error('Failed to save product edit', err);
      toast.error(err.message || 'Could not save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveForm = async (formDataPayload: any) => {
    setIsSaving(true);
    try {
      if (customSaveHandler) {
        await customSaveHandler(formDataPayload);
      }

      // 1. Persist to CMS Forms database collection
      const formId = formDataPayload.id || formDataPayload._id || itemData?.formId || itemData?._id;
      const endpoint = formId ? `/api/cms/forms/${encodeURIComponent(formId)}` : `/api/cms/forms`;
      const method = formId ? 'PUT' : 'POST';

      try {
        await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formDataPayload.name || formDataPayload.title,
            slug: formDataPayload.slug || 'contact-inquiry-form',
            purpose: formDataPayload.purpose || formDataPayload.settings?.purpose || 'general_contact',
            fields: formDataPayload.fields,
            settings: formDataPayload.settings,
          }),
        });
      } catch (err) {
        console.warn('Could not persist form to /api/cms/forms:', err);
      }

      // 2. Update CMS page section props in Redux
      if (sectionId) {
        dispatch(updatePageField({ sectionId, fieldPath: 'props.heading.en', value: formDataPayload.title }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.title.en', value: formDataPayload.title }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.formHeading.en', value: formDataPayload.title }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.subheading.en', value: formDataPayload.description }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.description.en', value: formDataPayload.description }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.formDescription.en', value: formDataPayload.description }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.submitButtonText.en', value: formDataPayload.buttonLabel }));
        dispatch(updatePageField({ sectionId, fieldPath: 'props.buttonText.en', value: formDataPayload.buttonLabel }));
        if (formDataPayload.successMessage) {
          dispatch(updatePageField({ sectionId, fieldPath: 'props.successMessage.en', value: formDataPayload.successMessage }));
        }
        if (formDataPayload.recipientEmail) {
          dispatch(updatePageField({ sectionId, fieldPath: 'props.recipientEmail', value: formDataPayload.recipientEmail }));
        }

        try {
          await dispatch(updatePageThunk());
        } catch {
          // Keep local state updated
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('arabmarble:form-updated', {
            detail: formDataPayload,
          })
        );
      }

      toast.success('Form configuration updated in database & reflected immediately.');
      closeReferenceEditor();
    } catch (err: any) {
      toast.error(err.message || 'Could not save form configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProject = async (projectPayload: any) => {
    setIsSaving(true);
    try {
      if (customSaveHandler) {
        await customSaveHandler(projectPayload);
      }

      const projId = projectPayload.id || itemData?.id || itemData?._id;
      const endpoint = projId ? `/api/cms/projects/${encodeURIComponent(projId)}` : `/api/cms/projects`;
      const method = projId ? 'PUT' : 'POST';

      const payload = {
        title: projectPayload.title,
        location: projectPayload.location,
        category: projectPayload.category,
        description: projectPayload.description,
        image: projectPayload.image,
        gallery: [projectPayload.image],
        status: 'published',
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.message || 'Failed to save project');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('arabmarble:project-updated', {
            detail: { ...payload, id: projId, _id: projId },
          })
        );
      }

      toast.success('Project updated successfully! Changes reflected immediately.');
      closeReferenceEditor();
    } catch (err: any) {
      toast.error(err.message || 'Could not save project.');
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeColor = (t: ReferenceItemType) => {
    switch (t) {
      case 'product':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'testimonial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'review':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'form':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'project':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getIcon = (t: ReferenceItemType) => {
    switch (t) {
      case 'product':
        return <Package size={17} className="text-emerald-600" />;
      case 'testimonial':
        return <MessageSquare size={17} className="text-amber-600" />;
      case 'review':
        return <Star size={17} className="text-sky-600" />;
      case 'form':
        return <FileText size={17} className="text-purple-600" />;
      case 'project':
        return <Building2 size={17} className="text-amber-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeReferenceEditor}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999998] transition-opacity animate-in fade-in"
      />

      {/* Slide-over Drawer / Canvas Modal */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-drawer-title"
        className={`fixed inset-y-0 right-0 z-[999999] w-full ${
          type === 'product' || type === 'form' || type === 'project'
            ? 'max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-[#0b0e14] text-slate-100'
            : 'max-w-md sm:max-w-lg bg-white dark:bg-neutral-900'
        } shadow-2xl flex flex-col border-l border-white/10 transition-transform duration-300 ease-out animate-in slide-in-from-right`}
      >
        {type === 'product' ? (
          <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#0b0e14]">
            {/* Product Top Header */}
            <div className="p-4 px-6 border-b border-white/10 bg-[#0e121a] flex items-center justify-between shrink-0">
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.15em] text-emerald-400 uppercase">
                  ARAB MARBLE CATALOG
                </p>
                <h2 id="ref-drawer-title" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Edit {itemData?.name || itemData?.title || 'Stone Product'}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeReferenceEditor}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
              {isLoadingProduct && !hydratedProduct ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-emerald-400" />
                  <p className="text-xs font-semibold tracking-wide uppercase">Loading Catalog...</p>
                </div>
              ) : (
                <CanvasProductForm
                  initialData={hydratedProduct || itemData}
                  allCategories={allCategories as any}
                  onSubmit={handleSaveProduct}
                  onCancel={closeReferenceEditor}
                  isLoading={isSaving}
                />
              )}
            </div>
          </div>
        ) : type === 'form' ? (
          <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#0b0e14]">
            <CanvasFormModal
              initialData={itemData}
              onSubmit={handleSaveForm}
              onCancel={closeReferenceEditor}
              isLoading={isSaving}
            />
          </div>
        ) : type === 'project' ? (
          <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#0b0e14]">
            <CanvasProjectModal
              initialData={itemData}
              onSubmit={handleSaveProject}
              onCancel={closeReferenceEditor}
              isLoading={isSaving}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-stone-50/70 dark:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 border border-[var(--border)] flex items-center justify-center shadow-xs">
                  {getIcon(type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(type)}`}>
                      Reference {type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <Sparkles size={12} /> Live Reflect
                    </span>
                  </div>
                  <h2 id="ref-drawer-title" className="text-base font-bold text-[var(--text)] mt-0.5 line-clamp-1">
                    {title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReferenceEditor}
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-stone-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

        {/* Scrollable Form Body */}
        <form id="ref-edit-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">

          {type === 'testimonial' && (
            <>
              {/* Author & Role */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author || ''}
                    onChange={(e) => handleChange('author', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm font-semibold text-[var(--text)] focus:border-[var(--primary)] outline-none"
                    placeholder="Sarah M."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Role / Pet Name
                  </label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm font-semibold text-[var(--text)] focus:border-[var(--primary)] outline-none"
                    placeholder="Dog Mom to Max"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Rating (Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleChange('rating', star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={
                          star <= (formData.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300 dark:text-neutral-700'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[var(--text-muted)] ml-2">
                    {formData.rating || 5} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Testimonial Quote
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.quote || ''}
                  onChange={(e) => handleChange('quote', e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:bg-white outline-none transition-all italic leading-relaxed"
                  placeholder="Share customer's words..."
                />
              </div>

              {/* Avatar Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Avatar / Pet Photo URL
                </label>
                <input
                  type="text"
                  value={formData.avatar || ''}
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-xs font-mono text-[var(--text)] focus:border-[var(--primary)] outline-none"
                  placeholder="https://... or /images/..."
                />
              </div>
            </>
          )}

          {type === 'review' && (
            <>
              {/* Reviewer Name */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author || ''}
                    onChange={(e) => handleChange('author', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm font-semibold text-[var(--text)] focus:border-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleChange('rating', star)}
                      >
                        <Star
                          size={18}
                          className={
                            star <= (formData.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Review Title / Headline
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm font-semibold text-[var(--text)] focus:border-[var(--primary)] outline-none"
                  placeholder="e.g. Life saver for my senior dog!"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Review Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-stone-50 dark:bg-neutral-800 text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                  placeholder="Write customer review..."
                />
              </div>

              {/* Verified Buyer Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={Boolean(formData.verified)}
                  onChange={(e) => handleChange('verified', e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-[var(--text)]">Verified Buyer Badge</span>
              </label>
            </>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border)] bg-stone-50/70 dark:bg-neutral-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeReferenceEditor}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-neutral-800 text-xs font-bold text-[var(--text)] hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ref-edit-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving & Reflecting...
              </>
            ) : (
              <>
                <Check size={14} /> Save & Reflect
              </>
            )}
          </button>
        </div>
      </>
    )}
  </aside>
</>
  );
}
