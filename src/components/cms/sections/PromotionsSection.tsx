'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import EditableText from '@/components/shared/EditableText';
import { ReferenceEditButton } from '@/components/cms/reference-editor';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProducts } from '@/lib/store/products/productsThunk';
import { X, CheckCircle2 } from 'lucide-react';

interface PromotionItem {
  title: string;
  price: string;
  size?: string;
  image?: string;
  productId?: string;
  productSlug?: string;
}

interface PromotionsSectionProps {
  block?: any;
  items?: PromotionItem[];
  title?: string;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const DEFAULT_PROMOTIONS: PromotionItem[] = [
  {
    productId: '6ae848555cd44cc45b374c5e',
    productSlug: 'light-emperador',
    title: 'Light Emperador – Spain',
    price: 'AED 175/m2',
    size: '600x600x20mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Light-Emperador-001-Clearance_FINAL.jpeg',
  },
  {
    productId: '6ae8484e5cd44cc45b374c5c',
    productSlug: 'crema-marfil',
    title: 'Crema Marfil',
    price: 'AED 100/m2',
    size: '600x600x20mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Marfil-2nd-Choice-001-Clearance_FINAL-768x768-1.jpeg',
  },
  {
    productId: '6ae8486d5cd44cc45b374c65',
    productSlug: 'cats-eye',
    title: 'Cat’s Eye',
    price: 'AED 60/m2',
    size: '600x300x20mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Cats-Eye-001-Clearance_FINAL.jpeg',
  },
  {
    productId: '6ae848715cd44cc45b374c66',
    productSlug: 'aegean-cream',
    title: 'Aegean Cream',
    price: 'AED 60/m2',
    size: '600x600x20mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Beige-001-Clearance.jpeg',
  },
  {
    productId: '6ae848745cd44cc45b374c67',
    productSlug: 'black-opal-quartz',
    title: 'Black Opal Quartz',
    price: 'AED 60/m2',
    size: '600x300x12mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Opal-e1620127429235.jpeg',
  },
  {
    productId: '6ae848605cd44cc45b374c61',
    productSlug: 'calacatta-oro',
    title: 'Calacatta Oro',
    price: 'AED 150-250/m2',
    size: '600x300x20mm',
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Beige-001-Clearance.jpeg',
  },
];

export default function PromotionsSection({
  block,
  items: itemsProp,
  locale = 'en',
  isEditable = false,
  onSave,
}: PromotionsSectionProps) {
  const dispatch = useAppDispatch();
  const allProducts = useAppSelector((state) => (state.products as any)?.allProducts || []);

  const [selectedPromo, setSelectedPromo] = useState<PromotionItem | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, allProducts?.length]);

  const props = block?.props || {};
  const items: PromotionItem[] = props.items || itemsProp || DEFAULT_PROMOTIONS;
  const blockId = block?.id || 'promotions-grid';

  const openEnquiryModal = (item: PromotionItem) => {
    setSelectedPromo(item);
    setSubmitted(false);
    setErrorMsg(null);
    setQuantity('');
    setNotes('');
  };

  const closeEnquiryModal = () => {
    setSelectedPromo(null);
    setSubmitted(false);
    setErrorMsg(null);
  };

  const handleEnquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPromo) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const composedMessage = [
        `Promotion Stone: ${selectedPromo.title}`,
        `Offer Price: ${selectedPromo.price}`,
        selectedPromo.size ? `Size: ${selectedPromo.size}` : '',
        quantity ? `Required Quantity / Area: ${quantity}` : '',
        notes ? `Additional Notes: ${notes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: `Promotion Enquiry: ${selectedPromo.title} (${selectedPromo.price})`,
          message: composedMessage,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit enquiry. Please try again.');
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white relative">
      <div className="max-w-[1140px] mx-auto px-6">
        {/* Top Reference Edit Bar for Section */}
        {isEditable && (
          <div className="flex justify-end mb-6">
            <ReferenceEditButton
              type="product"
              title="Manage Promotions Catalog"
              label="Manage Promotions"
              data={allProducts?.[0] || undefined}
              sectionId={blockId}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
          {items.map((item, idx) => {
            const itemProductId = item.productId ? String(item.productId) : undefined;
            const itemProductSlug = item.productSlug;

            const matchedProduct = allProducts.find((p: any) => {
              const pId = String(p._id || p.id || '');
              if (itemProductId && pId === itemProductId) return true;
              if (itemProductSlug && p.slug === itemProductSlug) return true;
              if (
                item.title &&
                p.name &&
                (item.title.toLowerCase().includes(p.name.toLowerCase()) ||
                  p.name.toLowerCase().includes(item.title.toLowerCase()))
              ) {
                return true;
              }
              return false;
            });

            const productDataForEditor = matchedProduct || {
              id: item.productId,
              _id: item.productId,
              slug: item.productSlug,
              name: item.title,
              title: item.title,
              price: item.price,
              image: item.image,
              sizes: item.size ? [item.size] : [],
            };

            const displayImage =
              item.image ||
              matchedProduct?.gallery?.[0]?.url ||
              matchedProduct?.image ||
              '/images/products/stone-1.jpg';

            return (
              <div key={idx} className="relative group pb-4">
                {/* Square Stone Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                  <img
                    src={displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/images/products/stone-1.jpg';
                    }}
                  />

                  {/* Per-Card Real Product Reference Edit Button */}
                  {isEditable && (
                    <div className="absolute top-4 right-4 z-20">
                      <ReferenceEditButton
                        type="product"
                        title={`Edit ${matchedProduct?.name || item.title}`}
                        data={productDataForEditor}
                        sectionId={blockId}
                        itemIndex={idx}
                        label="Edit Product"
                        compact
                      />
                    </div>
                  )}
                </div>

                {/* Overlapping Light-Grey Info Card matching reference */}
                <div
                  className="mx-5 sm:mx-8 -mt-24 sm:-mt-32 relative z-10 px-6 py-6 sm:px-9 sm:py-8 backdrop-blur-[2px]"
                  style={{ backgroundColor: 'rgba(229, 229, 229, 0.90)' }}
                >
                  {/* Title */}
                  <EditableText
                    value={item.title}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.title`, val)}
                    isEditable={isEditable}
                    tag="h3"
                    className="!text-[24px] sm:!text-[28px] md:!text-[40px] !font-light tracking-normal !text-[#555555] mb-4 border-b border-[#b5b5b5] pb-3.5 !leading-[1.2]"
                    placeholder="Promotion Title..."
                  />

                  {/* Price */}
                  <EditableText
                    value={item.price}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.price`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="!text-[16px] sm:!text-[25px] !font-bold tracking-normal !text-[#4a4a4a] pt-2"
                    placeholder="Price (e.g. AED 175/m2)..."
                  />

                  {/* Size */}
                  <EditableText
                    value={item.size || ''}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.size`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="!text-[13px] sm:!text-[18px] !font-normal !text-[#555555] mt-2"
                    placeholder="Size (e.g. 600x600x20mm)..."
                  />

                  {/* Enquiry Action */}
                  {/* <div className="mt-3.5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => openEnquiryModal(item)}
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#333333] hover:text-black border-b border-[#777777] hover:border-black pb-0.5 transition-colors cursor-pointer"
                    >
                      {locale === 'ar' ? 'استفسر الآن ←' : 'Enquire Now →'}
                    </button>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotion Enquiry Modal */}
      {selectedPromo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeEnquiryModal}
        >
          <div
            className="bg-white w-full max-w-lg border border-neutral-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEnquiryModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-[#333333]">Enquiry Received</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Thank you for enquiring about <strong className="text-[#333333]">{selectedPromo.title}</strong> ({selectedPromo.price}). Our team will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={closeEnquiryModal}
                  className="mt-2 px-8 py-3 bg-[#333333] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 pr-6 border-b border-neutral-200 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-semibold mb-1">
                    Promotion Enquiry
                  </p>
                  <h3 className="text-xl font-semibold text-[#333333]">{selectedPromo.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-600">
                    <span className="font-bold text-[#222222]">{selectedPromo.price}</span>
                    {selectedPromo.size && <span>• {selectedPromo.size}</span>}
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-sm border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-sm border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 000 0000"
                        className="w-full rounded-sm border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                        Approx. Quantity (m²)
                      </label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 120 m²"
                        className="w-full rounded-sm border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                      Project Details / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Delivery location, finish preference, or timeline..."
                      className="w-full rounded-sm border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-700 resize-y"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3 bg-[#333333] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? 'Submitting...' : 'Submit Enquiry'}
                    </button>
                    <Link
                      href={`/contact?subject=${encodeURIComponent(`Promotion Enquiry: ${selectedPromo.title}`)}`}
                      className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-4"
                    >
                      Open full Contact Form
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
