"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { defaultContactFormData } from "./contactFormData";
import { useAppSelector } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";

const iconMap: Record<string, any> = {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
};

interface ContactFormProps {
  data?: any;
}

export const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const { currentPages } = useAppSelector((state) => state.pages);
  const { locale } = useParams();
  const lang = (locale as string) || "en";

  const getLocalizedValue = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.en || "";
    }
    return val;
  };

  // Find sections from Redux store currentPages
  const contactInfoSection = useMemo(() => {
    return currentPages?.content?.find(
      (sec: any) => sec.type === "contact-info",
    );
  }, [currentPages]);

  const formSection = useMemo(() => {
    return currentPages?.content?.find((sec: any) => sec.type === "form");
  }, [currentPages]);

  // Resolve Contact Info
  const contactHeading = useMemo(() => {
    const heading =
      contactInfoSection?.props?.sectionHeading ||
      defaultContactFormData.props.sectionHeading;
    return getLocalizedValue(heading);
  }, [contactInfoSection, lang]);

  const contactItems = useMemo(() => {
    if (
      contactInfoSection?.content &&
      Array.isArray(contactInfoSection.content)
    ) {
      return contactInfoSection.content.map((item: any) => ({
        icon: item.props?.icon,
        label: item.props?.label,
        value: item.props?.value,
        href: item.props?.href,
      }));
    }
    return defaultContactFormData.props.contactItems;
  }, [contactInfoSection]);

  // Resolve Form Content
  const formProps = formSection?.props;
  const formConfig = formProps?.form;

  // Render fields from config, if not present fallback to standard default fields
  const defaultFields = useMemo(
    () => [
      {
        id: "field-name",
        type: "text",
        name: "name",
        label: defaultContactFormData.props.nameLabel,
        placeholder: defaultContactFormData.props.namePlaceholder,
        required: true,
      },
      {
        id: "field-email",
        type: "email",
        name: "email",
        label: defaultContactFormData.props.emailLabel,
        placeholder: defaultContactFormData.props.emailPlaceholder,
        required: true,
      },
      {
        id: "field-subject",
        type: "select",
        name: "subject",
        label: defaultContactFormData.props.subjectLabel,
        placeholder: { en: "Select an option", hi: "एक विकल्प चुनें" },
        required: true,
        options: defaultContactFormData.props.subjectOptions
          .filter((opt) => opt.value !== "")
          .map((opt) => ({
            value: opt.value,
            label: opt.label,
          })),
      },
      {
        id: "field-message",
        type: "textarea",
        name: "message",
        label: defaultContactFormData.props.messageLabel,
        placeholder: defaultContactFormData.props.messagePlaceholder,
        required: true,
      },
    ],
    [],
  );

  const fieldsToRender = useMemo(() => {
    return formConfig?.fields || defaultFields;
  }, [formConfig, defaultFields]);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form state
  useEffect(() => {
    const initial: Record<string, any> = {};
    fieldsToRender.forEach((field: any) => {
      const key = field.name || field.id;
      initial[key] = field.type === "checkbox" ? false : "";
    });
    setFormData(initial);
  }, [fieldsToRender]);

  const formHeading =
    getLocalizedValue(formProps?.formHeading) ||
    getLocalizedValue(defaultContactFormData.props.formHeading);
  const formDescription =
    getLocalizedValue(formProps?.formDescription) ||
    getLocalizedValue(defaultContactFormData.props.formDescription);
  const successHeading =
    getLocalizedValue(formProps?.successHeading) ||
    getLocalizedValue(defaultContactFormData.props.successHeading);
  const successDescription =
    getLocalizedValue(formProps?.successDescription) ||
    getLocalizedValue(defaultContactFormData.props.successDescription);
  const successButtonText =
    getLocalizedValue(formProps?.successButtonText) ||
    getLocalizedValue(defaultContactFormData.props.successButtonText);
  const submitButtonText =
    getLocalizedValue(formProps?.submitButtonText) ||
    getLocalizedValue(defaultContactFormData.props.submitButtonText);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || "peekeeper";
      const actualFormIdentifier =
        formProps?.formId?.value ||
        formProps?.formId ||
        formProps?.formSlug?.value ||
        formProps?.formSlug ||
        formConfig?.id ||
        formConfig?.slug ||
        "contact-inquiry-form";

      const endpoint = `/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(actualFormIdentifier)}/submissions`;
      const payload = {
        data: formData,
        context: {
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (
        response.ok &&
        (responseData.success || responseData.id || response.status === 201)
      ) {
        setIsSubmitted(true);
        // Reset form values
        const resetData: Record<string, any> = {};
        fieldsToRender.forEach((f: any) => {
          const key = f.name || f.id;
          resetData[key] = f.type === "checkbox" ? false : "";
        });
        setFormData(resetData);
      } else {
        alert(
          responseData.message || "Something went wrong. Please try again.",
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to send message. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getFieldGridClass = (type: string) => {
    if (type === "textarea" || type === "checkbox" || type === "terms") {
      return "col-span-2";
    }
    return "col-span-2 md:col-span-1";
  };

  return (
    <section className="py-32 px-[5%] max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-24">
        {/* Left Side: Info Cards */}
        <div className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black mb-10 tracking-tight">
              <EditableText
                value={contactHeading}
                currentPages={currentPages}
                sectionId={contactInfoSection?.id}
                fieldPath="props.sectionHeading"
              />
            </h2>
            <div className="space-y-12">
              {contactItems?.map((item: any, index: number) => {
                const IconComponent = iconMap[item.icon] || MapPin;
                return (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                        <IconComponent size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[2px] text-muted">
                        <EditableText
                          value={getLocalizedValue(item.label)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.label`}
                        />
                      </span>
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-2xl font-bold tracking-tight inline-block"
                      >
                        <EditableText
                          value={getLocalizedValue(item.value)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.value`}
                        />
                      </a>
                    ) : (
                      <p className="text-2xl font-bold tracking-tight">
                        <EditableText
                          value={getLocalizedValue(item.value)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.value`}
                        />
                      </p>
                    )}
                    <div className="w-0 group-hover:w-full h-px bg-secondary transition-all duration-500 mt-2" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />

          <div className="bg-surface border border-border p-10 lg:p-16 rounded-[48px] shadow-2xl relative z-10">
            {isSubmitted ? (
              <div className="py-20 text-center">
                <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tight">
                  <EditableText
                    value={successHeading}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successHeading"
                  />
                </h3>
                <p className="text-muted font-semibold mb-10 text-lg">
                  <EditableText
                    value={successDescription}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successDescription"
                    tag="p"
                  />
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-primary text-white px-12 h-14 rounded-full text-[15px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <EditableText
                    value={successButtonText}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successButtonText"
                  />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight mb-2">
                    <EditableText
                      value={formHeading}
                      currentPages={currentPages}
                      sectionId={formSection?.id}
                      fieldPath="props.formHeading"
                    />
                  </h3>
                  <p className="text-muted font-semibold">
                    <EditableText
                      value={formDescription}
                      currentPages={currentPages}
                      sectionId={formSection?.id}
                      fieldPath="props.formDescription"
                      tag="p"
                    />
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  {fieldsToRender.map((field: any) => {
                    const fieldKey = field.name || field.id;
                    const gridClass = getFieldGridClass(field.type);

                    return (
                      <div key={field.id} className={`${gridClass} space-y-3`}>
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-muted ml-1 flex items-center gap-1 select-none">
                          {getLocalizedValue(field.label)}
                          {field.required && (
                            <span className="text-primary font-bold ml-0.5">
                              •
                            </span>
                          )}
                        </label>

                        {field.type === "textarea" ? (
                          <textarea
                            required={field.required}
                            name={fieldKey}
                            value={formData[fieldKey] || ""}
                            onChange={handleChange}
                            rows={4}
                            placeholder={getLocalizedValue(field.placeholder)}
                            className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-secondary transition-all font-bold text-xl resize-none placeholder:text-muted/30"
                          />
                        ) : field.type === "select" ? (
                          <select
                            required={field.required}
                            name={fieldKey}
                            value={formData[fieldKey] || ""}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-secondary transition-all font-bold text-xl appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-surface">
                              {getLocalizedValue(field.placeholder) ||
                                "Select an option"}
                            </option>
                            {(field.options || []).map(
                              (option: any, index: number) => {
                                const val =
                                  typeof option === "object"
                                    ? option.value
                                    : option;
                                const label =
                                  typeof option === "object"
                                    ? getLocalizedValue(option.label)
                                    : option;
                                return (
                                  <option
                                    key={index}
                                    value={val}
                                    className="bg-surface"
                                  >
                                    {label}
                                  </option>
                                );
                              },
                            )}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-3 py-2">
                            <input
                              type="checkbox"
                              required={field.required}
                              name={fieldKey}
                              checked={!!formData[fieldKey]}
                              onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    [fieldKey]: e.target.checked,
                                  });
                              }}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-secondary cursor-pointer"
                              id={field.id}
                            />
                            <label
                              htmlFor={field.id}
                              className="text-sm font-bold text-muted cursor-pointer select-none"
                            >
                              {getLocalizedValue(field.placeholder) ||
                                getLocalizedValue(field.label)}
                            </label>
                          </div>
                        ) : (
                          <input
                            required={field.required}
                            type={field.type || "text"}
                            name={fieldKey}
                            value={formData[fieldKey] || ""}
                            onChange={handleChange}
                            placeholder={getLocalizedValue(field.placeholder)}
                            className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-secondary transition-all font-bold text-xl placeholder:text-muted/30"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full flex relative h-12 items-center justify-center rounded-full bg-primary px-8 text-[14px] font-semibold uppercase tracking-wider text-white transition-all overflow-hidden scroll-mt-20 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex gap-2 items-center">
                    <EditableText
                      value={submitButtonText}
                      currentPages={currentPages}
                      sectionId={formSection?.id}
                      fieldPath="props.submitButtonText"
                    />
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
