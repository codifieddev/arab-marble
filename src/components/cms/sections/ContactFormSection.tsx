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

  const showMap =
    props.showMap === true ||
    (props.showMap !== false && props.hideMap !== true && Boolean(props.mapImage) && props.mapImage !== 'none');
  const mapImage = showMap ? (props.mapImage || '/images/contact-map.jpg') : null;
  const phone = t(props.phone, locale) || '+971 2 555 4008';
  const fax = t(props.fax, locale) || '+971 2 555 4005';
  const email = t(props.email, locale) || 'am@arabmarble.ae';
  const address = t(props.address, locale) || 'Arab Marble, Mussafah Abu Dhabi - UAE\nP.O.Box: 3835';

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
    <section className="py-12 md:py-24 bg-[#f9f9f9] relative">
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
          <div className="w-full mb-16 overflow-hidden border border-neutral-200 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-20">
          {/* Left Column: Contact Details */}
          <div>
            <EditableText
              value={t(props.contactHeading, locale) || t(props.heading, locale) || 'Contact Us'}
              onSave={(val) => onSave?.(block.id, 'props.contactHeading', val)}
              isEditable={isEditable}
              tag="h2"
              className="text-[24px] md:text-[30px] font-bold text-[#333333] tracking-tight leading-tight mb-6 md:mb-10"
              placeholder="Heading..."
            />

            <div className="space-y-5 md:space-y-7 pt-4 md:pt-8">
              {/* Phone */}
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#505050] border border-neutral-200 bg-white shadow-sm">
                  <Phone size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[10px] uppercase font-semibold tracking-[0.18em] text-neutral-400 mb-1">
                    {t(props.phoneHeading, locale) || 'Phone'}
                  </p>
                  <EditableText
                    value={phone}
                    onSave={(val) => onSave?.(block.id, 'props.phone', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-[16px] font-normal text-[#333333] leading-snug"
                    placeholder="Phone number..."
                  />
                </div>
              </div>

              {/* FAX */}
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#505050] border border-neutral-200 bg-white shadow-sm">
                  <Printer size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[10px] uppercase font-semibold tracking-[0.18em] text-neutral-400 mb-1">
                    {t(props.faxHeading, locale) || 'Fax'}
                  </p>
                  <EditableText
                    value={fax}
                    onSave={(val) => onSave?.(block.id, 'props.fax', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-[16px] font-normal text-[#333333] leading-snug"
                    placeholder="Fax number..."
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#505050] border border-neutral-200 bg-white shadow-sm">
                  <Mail size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[10px] uppercase font-semibold tracking-[0.18em] text-neutral-400 mb-1">
                    {t(props.emailHeading, locale) || 'Email'}
                  </p>
                  <EditableText
                    value={email}
                    onSave={(val) => onSave?.(block.id, 'props.email', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-[16px] font-normal text-[#333333] leading-snug"
                    placeholder="Email address..."
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#505050] border border-neutral-200 bg-white shadow-sm">
                  <MapPin size={17} strokeWidth={1.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[10px] uppercase font-semibold tracking-[0.18em] text-neutral-400 mb-1">
                    {t(props.addressHeading, locale) || 'Address'}
                  </p>
                  <EditableText
                    value={address}
                    onSave={(val) => onSave?.(block.id, 'props.address', val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-[16px] font-normal text-[#333333] whitespace-pre-line leading-relaxed"
                    placeholder="Physical address..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <EditableText
                value={t(props.formHeading, locale) || t(props.subheading, locale) || 'Project Enquiry Form'}
                onSave={(val) => onSave?.(block.id, 'props.formHeading', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-[24px] md:text-[30px] font-bold text-[#333333] tracking-tight leading-tight"
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

            {/* Dynamic Interactive Form */}
            <DynamicCanvasForm
              formSlug={formSlug}
              formId={formId || formDef?._id || formDef?.id}
              heading=""
              subheading=""
              submitButtonText={t(props.submitButtonText, locale) || 'SUBMIT ENQUIRY'}
              theme="plain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
