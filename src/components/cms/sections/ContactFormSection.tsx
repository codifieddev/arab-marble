'use client';

import React, { useState, useEffect } from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { ReferenceEditButton } from '@/components/cms/reference-editor';
import DynamicCanvasForm from '@/components/forms/DynamicCanvasForm';
import { t } from '@/lib/i18n';
import { Phone, Printer, Mail, MapPin } from 'lucide-react';

interface ContactFormSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function ContactFormSection({
  block,
  locale = 'en',
  isEditable = false,
  onSave,
}: ContactFormSectionProps) {
  const props = block.props || {};

  const mapImage = props.mapImage || '/images/contact-map.jpg';
  const phone = props.phone || '+971 2 555 4008';
  const fax = props.fax || '+971 2 555 4005';
  const email = props.email || 'am@arabmarble.ae';
  const address = props.address || 'Arab Marble, Mussafah Abu Dhabi - UAE\nP.O.Box: 3835';

  const formSlug = (block as any).references?.formSlug || props.formSlug || 'contact-inquiry-form';
  const formId = (block as any).references?.formId || props.formId || undefined;

  const [formDef, setFormDef] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFormDefinition = async () => {
      try {
        const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble';
        const identifier = formId || formSlug || 'contact-inquiry-form';
        const res = await fetch(`/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(identifier)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setFormDef(json.data);
          }
        }
      } catch (err) {
        console.warn('[ContactFormSection] Could not load dynamic form definition:', err);
      }
    };

    fetchFormDefinition();

    const handleFormUpdate = (e: any) => {
      if (e.detail && isMounted) {
        setFormDef((prev: any) => ({
          ...prev,
          ...e.detail,
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('arabmarble:form-updated', handleFormUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('arabmarble:form-updated', handleFormUpdate);
      }
    };
  }, [formId, formSlug]);

  return (
    <section className="py-12 md:py-16 bg-white relative">
      <div className="max-w-[1140px] mx-auto px-6">
        {/* Top Reference Edit Bar */}
        {isEditable && (
          <div className="flex justify-end mb-6">
            <ReferenceEditButton
              type="form"
              title="Configure Contact Form & Email"
              label="Edit Form Builder"
              sectionId={block.id}
              data={formDef || {
                name: 'Contact & Inquiry Form',
                slug: formSlug,
                fields: [
                  { id: 'f-name', type: 'text', name: 'name', label: 'Name', required: true },
                  { id: 'f-email', type: 'email', name: 'email', label: 'Email Address', required: true },
                  { id: 'f-phone', type: 'phone', name: 'phone', label: 'Phone Number', required: false },
                  { id: 'f-subject', type: 'text', name: 'subject', label: 'Subject', required: false },
                  { id: 'f-message', type: 'textarea', name: 'message', label: 'Message', required: true },
                ],
                settings: {
                  sendEmail: true,
                  email: {
                    to: 'am@arabmarble.ae',
                    from: 'Arab Marble <noreply@arabmarble.ae>',
                    subject: 'New Arab Marble Inquiry from [name]',
                    replyTo: '[email]',
                    body: 'You received a new inquiry from Arab Marble website:\n\nName: [name]\nEmail: [email]\nPhone: [phone]\nSubject: [subject]\nMessage: [message]',
                  },
                  successMessage: 'Thank you for reaching out to Arab Marble. Your inquiry has been received and our team will get in touch shortly.',
                  submitButtonText: 'SEND MESSAGE',
                },
              }}
            />
          </div>
        )}

        {/* Map Banner */}
        {mapImage && (
          <div className="w-full mb-16 overflow-hidden rounded-none border border-neutral-200 shadow-sm">
            <img
              src={mapImage}
              alt="Arab Marble Mussafah Abu Dhabi Location Map"
              className="w-full h-auto max-h-[380px] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Contact Info & Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Contact Details */}
          <div className="space-y-8">
            <EditableText
              value={t(props.contactHeading, locale) || 'Contact Us'}
              onSave={(val) => onSave?.(block.id, 'props.contactHeading', val)}
              isEditable={isEditable}
              tag="h2"
              className="text-2xl font-bold text-neutral-800 tracking-tight"
              placeholder="Heading..."
            />

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700">
                  <Phone size={18} />
                </div>
                <div className="flex-1">
                  <EditableText
                    value={t(props.phoneHeading, locale) || 'Phone'}
                    onSave={(val) => onSave?.(block.id, 'props.phoneHeading', val)}
                    isEditable={isEditable}
                    tag="p"
                    className="text-xs uppercase font-semibold tracking-wider text-neutral-400"
                    placeholder="Phone Label..."
                  />
                  <EditableText
                    value={phone}
                    onSave={(val) => onSave?.(block.id, 'props.phone', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-sm md:text-base font-medium text-neutral-800 hover:text-black"
                    placeholder="Phone number..."
                  />
                </div>
              </div>

              {/* FAX */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700">
                  <Printer size={18} />
                </div>
                <div className="flex-1">
                  <EditableText
                    value={t(props.faxHeading, locale) || 'FAX'}
                    onSave={(val) => onSave?.(block.id, 'props.faxHeading', val)}
                    isEditable={isEditable}
                    tag="p"
                    className="text-xs uppercase font-semibold tracking-wider text-neutral-400"
                    placeholder="FAX Label..."
                  />
                  <EditableText
                    value={fax}
                    onSave={(val) => onSave?.(block.id, 'props.fax', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-sm md:text-base font-medium text-neutral-800"
                    placeholder="Fax number..."
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <EditableText
                    value={t(props.emailHeading, locale) || 'Email'}
                    onSave={(val) => onSave?.(block.id, 'props.emailHeading', val)}
                    isEditable={isEditable}
                    tag="p"
                    className="text-xs uppercase font-semibold tracking-wider text-neutral-400"
                    placeholder="Email Label..."
                  />
                  <EditableText
                    value={email}
                    onSave={(val) => onSave?.(block.id, 'props.email', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-sm md:text-base font-medium text-neutral-800 hover:underline"
                    placeholder="Email address..."
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <EditableText
                    value={t(props.addressHeading, locale) || 'Address'}
                    onSave={(val) => onSave?.(block.id, 'props.addressHeading', val)}
                    isEditable={isEditable}
                    tag="p"
                    className="text-xs uppercase font-semibold tracking-wider text-neutral-400"
                    placeholder="Address Label..."
                  />
                  <EditableText
                    value={address}
                    onSave={(val) => onSave?.(block.id, 'props.address', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-sm md:text-base font-medium text-neutral-800 whitespace-pre-line leading-relaxed"
                    placeholder="Physical address..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Email Us Form */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <EditableText
                value={t(props.formHeading, locale) || 'Email Us'}
                onSave={(val) => onSave?.(block.id, 'props.formHeading', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-2xl font-bold text-neutral-800 tracking-tight"
                placeholder="Form Heading..."
              />
              {isEditable && (
                <ReferenceEditButton
                  type="form"
                  title="Configure Form Fields & Email Template"
                  label="Form Config"
                  sectionId={block.id}
                  data={formDef || {
                    name: 'Contact & Inquiry Form',
                    slug: formSlug,
                  }}
                  compact
                />
              )}
            </div>

            {/* Dynamic Interactive Form connected to MongoDB & Admin Console */}
            <DynamicCanvasForm
              formSlug={formSlug}
              formId={formId || formDef?._id || formDef?.id}
              heading=""
              subheading=""
              submitButtonText={props.submitButtonText || 'SEND MESSAGE'}
              theme="plain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
