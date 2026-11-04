"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { usePathname } from "next/navigation";
import { defaultNewsletterData } from "./newsletterData";
import { fetchAllForm } from "@/lib/store/forms/formsThunk";
import { RootState } from "@/lib/store/store";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

const Newsletter = ({ section: propSection }: { section?: any }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const isEditable = useAppSelector((state) => state.pages.isEditable);
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find((page: any) => page.adminTitle === "Newsletter Section");
  }, [currentPages]);

  const section = propSection || getCurrentSection;
  const p = (section as any)?.props || defaultNewsletterData.props;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const title = getV(p.title);
  const description = getV(p.description);
  const joinTitle = getV(p.joinTitle);
  const joinSub = getV(p.joinSub);
  const buttonLabel = getV(p.buttonLabel);
  const msgSuccess = getV(p.msgSuccess);

  const feature1 = getV(p.feature1);
  const feature2 = getV(p.feature2);
  const feature3 = getV(p.feature3);

  const noSpam = getV(p.noSpam);
  const unsubscribe = getV(p.unsubscribe);
  const updates = getV(p.updates);

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  const { allForms, isFetchedForms } = useAppSelector((state: RootState) => state.forms);

  const subscriptionForm = useMemo(() => {
    if(allForms && allForms.length>0){
      const form = allForms?.find((f) => f.name === "Subscribtion Forms");
      return form;
    }
    return null
  }, [allForms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || "peekeeper";
      const formTarget = subscriptionForm?._id || (subscriptionForm as any)?.document_key || "subscribtion-forms";
      const res = await fetch(`/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(formTarget)}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formData,
          context: {
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
            referrer: typeof document !== "undefined" ? document.referrer : "",
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          },
        }),
      });
      if (res.ok) {
        setMsg(msgSuccess || "Thank you for subscribing!");
        setFormData({});
      } else {
        setMsg("Subscription received. Thank you!");
        setFormData({});
      }
    } catch (error) {
      console.log("Newsletter submission error:", error);
      setMsg(msgSuccess || "Thank you for subscribing!");
      setFormData({});
    }
  };

  return (
    <section
      data-annotate-id="home-newsletter-section"
      className="relative overflow-hidden border-y border-white/10 bg-[#0E6E35] px-[5%] py-[90px] text-white lg:py-[110px]"
    >
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[280px] w-[280px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-80px] h-[320px] w-[320px] rounded-full bg-[#B8D35A]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* left content */}
          <div className="max-w-[760px]">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[3px] text-[#B8D35A]">
                <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
              </span>
            </div>

            <h3 className="max-w-[760px] font-heading text-[42px] font-bold leading-[0.95] tracking-[-0.03em] text-white sm:text-[56px] lg:text-[74px]">
              <EditableText value={title} isEditable={isEditable} onSave={handle('props.title.en')} tag="span" />
            </h3>

            <p className="mt-6 max-w-[620px] text-[18px] font-medium leading-8 text-white/80 sm:text-[20px]">
              <EditableText value={description} isEditable={isEditable} onSave={handle('props.description.en')} tag="span" />
            </p>

            <div className="mt-10 hidden items-center gap-8 text-white/65 lg:flex">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8D35A]" />
                <span className="text-[14px] font-semibold">
                  <EditableText value={feature1} isEditable={isEditable} onSave={handle('props.feature1.en')} tag="span" />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8D35A]" />
                <span className="text-[14px] font-semibold">
                  <EditableText value={feature2} isEditable={isEditable} onSave={handle('props.feature2.en')} tag="span" />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8D35A]" />
                <span className="text-[14px] font-semibold">
                  <EditableText value={feature3} isEditable={isEditable} onSave={handle('props.feature3.en')} tag="span" />
                </span>
              </div>
            </div>
          </div>

          {/* right form card */}
          <div className="lg:justify-self-end">
            <div className="w-full max-w-[540px] rounded-[12px] border border-white/12 bg-white/10 p-4  sm:p-5">
              <div className="mb-4">
                <p className="text-[18px] font-semibold text-white/85">
                  <EditableText value={joinTitle} isEditable={isEditable} onSave={handle('props.joinTitle.en')} tag="span" />
                </p>
                <p className="mt-1 text-[13px] leading-6 text-white/80">
                  <EditableText value={joinSub} isEditable={isEditable} onSave={handle('props.joinSub.en')} tag="span" />
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  {subscriptionForm?.fields?.map((field: any) => (
                    <div key={field.id} className="flex-1">
                      <label className="mb-1.5 block text-[13px] font-semibold text-white/75 ml-1">
                        {field.placeholder}
                      </label>
                      <input
                        className="py-4 w-full rounded-full border border-white/15 bg-white px-5 text-[16px] font-medium text-black outline-none transition placeholder:text-black/45 focus:border-[#B8D35A] focus:ring-2 focus:ring-[#B8D35A]/30"
                        type={field.type === "text" && field.name?.toLowerCase().includes("email") ? "email" : field.type}
                        placeholder={field.placeholder || field.label}
                        required={field.required}
                        value={formData[field?.placeholder??""] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field?.placeholder??""]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}

                  <button
                    className="inline-flex py-4 items-center justify-center rounded-full bg-[#B8D35A] px-7 text-[14px] font-extrabold uppercase tracking-[0.14em] text-[#14351F] transition hover:translate-y-[-1px] hover:bg-[#c7df72] sm:h-[58px]"
                    type="submit"
                  >
                    <EditableText value={buttonLabel} isEditable={isEditable} onSave={handle('props.buttonLabel.en')} tag="span" />
                  </button>
                </div>
              </form>

              {msg && (
                <p className="mt-3 text-[13px] font-medium text-white/75">
                  {msg}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-white/55">
                <span><EditableText value={noSpam} isEditable={isEditable} onSave={handle('props.noSpam.en')} tag="span" /></span>
                <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" />
                <span><EditableText value={unsubscribe} isEditable={isEditable} onSave={handle('props.unsubscribe.en')} tag="span" /></span>
                <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" />
                <span><EditableText value={updates} isEditable={isEditable} onSave={handle('props.updates.en')} tag="span" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
