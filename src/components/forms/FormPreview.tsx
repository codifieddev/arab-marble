"use client";

import React from "react";
import { CheckCircle2, Eye, Send, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/lib/store/forms/formsType";
import { cn } from "@/lib/utils";

interface FormPreviewTabProps {
  fields: FormField[];
  successMessage: string;
  previewValues: Record<string, any>;
  setPreviewValues: (val: Record<string, any>) => void;
  isSubmitted: boolean;
  handlePreviewSubmit: (e: React.FormEvent) => void;
}

function renderInteractiveField(
  field: FormField,
  previewValues: Record<string, any>,
  setPreviewValues: (val: Record<string, any>) => void,
) {
  const common =
    "w-full rounded-[12px] border border-border/80 bg-surface dark:bg-surface/50 px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-muted-foreground/50 shadow-inner";

  if (field.type === "textarea") {
    return (
      <textarea
        className="w-full rounded-[16px] border border-border/80 bg-surface dark:bg-surface/50 px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-muted-foreground/50 shadow-inner"
        placeholder={field.placeholder || field.label}
        rows={4}
        value={previewValues[field.name] || ""}
        onChange={(e) =>
          setPreviewValues({ ...previewValues, [field.name]: e.target.value })
        }
      />
    );
  }
  
  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          className="w-full appearance-none rounded-[12px] border border-border/80 bg-surface dark:bg-surface/50 px-4 py-3.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all cursor-pointer shadow-inner"
          value={previewValues[field.name] || ""}
          onChange={(e) =>
            setPreviewValues({ ...previewValues, [field.name]: e.target.value })
          }
        >
          <option value="" className="text-muted-foreground">Select {field.label || field.name}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt} className="bg-surface text-foreground">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground/75">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(field.options || ["Option"]).map((opt) => {
          const isChecked = !!previewValues[`${field.name}_${opt}`];
          return (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-[12px] border text-sm cursor-pointer transition-all duration-200 select-none",
                isChecked
                  ? "bg-secondary/10 border-secondary text-foreground font-semibold shadow-sm"
                  : "bg-surface/50 border-border/60 text-muted-foreground hover:border-border hover:bg-surface hover:text-foreground"
              )}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={(e) =>
                    setPreviewValues({
                      ...previewValues,
                      [`${field.name}_${opt}`]: e.target.checked,
                    })
                  }
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                    isChecked
                      ? "bg-secondary border-secondary text-primary-foreground"
                      : "bg-surface border-border/80"
                  )}
                >
                  {isChecked && <Check size={12} strokeWidth={3.5} className="text-foreground dark:text-background" />}
                </div>
              </div>
              <span className="leading-none">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(field.options || ["Option"]).map((opt) => {
          const isSelected = previewValues[field.name] === opt;
          return (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-[12px] border text-sm cursor-pointer transition-all duration-200 select-none",
                isSelected
                  ? "bg-secondary/10 border-secondary text-foreground font-semibold shadow-sm"
                  : "bg-surface/50 border-border/60 text-muted-foreground hover:border-border hover:bg-surface hover:text-foreground"
              )}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name={field.name}
                  className="sr-only"
                  checked={isSelected}
                  onChange={() =>
                    setPreviewValues({ ...previewValues, [field.name]: opt })
                  }
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-secondary border-secondary"
                      : "bg-surface border-border/80"
                  )}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground dark:bg-background" />
                  )}
                </div>
              </div>
              <span className="leading-none">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === "terms") {
    const isChecked = !!previewValues[field.name];
    return (
      <label
        className={cn(
          "flex items-start gap-3 p-3.5 rounded-[12px] border text-sm cursor-pointer transition-all duration-200 select-none",
          isChecked
            ? "bg-secondary/10 border-secondary text-foreground font-semibold shadow-sm"
            : "bg-surface/50 border-border/60 text-muted-foreground hover:border-border hover:bg-surface hover:text-foreground"
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={(e) =>
              setPreviewValues({
                ...previewValues,
                [field.name]: e.target.checked,
              })
            }
          />
          <div
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              isChecked
                ? "bg-secondary border-secondary text-primary-foreground"
                : "bg-surface border-border/80"
            )}
          >
            {isChecked && <Check size={12} strokeWidth={3.5} className="text-foreground dark:text-background" />}
          </div>
        </div>
        <span className="leading-relaxed text-xs sm:text-sm">
          {field.placeholder || "I accept the Terms and Conditions"}
        </span>
      </label>
    );
  }

  return (
    <input
      className={common}
      type={field.type}
      placeholder={field.placeholder || field.label || field.name}
      value={previewValues[field.name] || ""}
      onChange={(e) =>
        setPreviewValues({ ...previewValues, [field.name]: e.target.value })
      }
    />
  );
}

export default function FormPreviewTab({
  fields,
  successMessage,
  previewValues,
  setPreviewValues,
  isSubmitted,
  handlePreviewSubmit,
}: FormPreviewTabProps) {
  return (
    <></>
    // <div className="max-w-2xl mx-auto">
    //   <div className="relative overflow-hidden bg-surface border border-border/80 shadow-md rounded-[24px] p-6 sm:p-8 md:p-10 backdrop-blur-md transition-all duration-300">
    //     {/* Decorative background gradients */}
    //     <div className="pointer-events-none absolute inset-0 -z-10">
    //       <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-secondary/5 blur-2xl dark:bg-secondary/10" />
    //       <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
    //     </div>

    //     {/* Header section */}
    //     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6 mb-8">
    //       <div>
    //         <div className="flex items-center gap-2">
    //           <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-secondary/15 text-secondary">
    //             <Eye size={14} />
    //           </span>
    //           <span className="text-[10px] font-black uppercase tracking-[2.5px] text-secondary">
    //             Live Form Preview
    //           </span>
    //         </div>
    //         <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-3 tracking-tight">
    //           Interactive Form Preview
    //         </h3>
    //         <p className="text-xs text-muted-foreground mt-1">
    //           Verify how your custom form renders and captures user submissions
    //         </p>
    //       </div>
    //     </div>

    //     {/* Success message banner */}
    //     {isSubmitted && (
    //       <div className="flex items-start gap-3.5 p-5 rounded-[16px] bg-secondary/10 border border-secondary/35 text-foreground animate-in fade-in slide-in-from-top-4 duration-300 mb-8 shadow-sm">
    //         <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={18} />
    //         <div className="space-y-1">
    //           <p className="text-xs font-black uppercase tracking-[1.5px] text-secondary">
    //             Form Submitted Successfully
    //           </p>
    //           <p className="text-sm font-medium leading-relaxed">
    //             {successMessage || "Your submission was recorded successfully."}
    //           </p>
    //         </div>
    //       </div>
    //     )}

    //     <form onSubmit={handlePreviewSubmit} className="space-y-6">
    //       {fields.map((field) => (
    //         <div key={field.id} className="space-y-2">
    //           <label className="text-[10px] font-black uppercase tracking-[2px] text-foreground/80 flex items-center gap-1.5 ml-1 select-none">
    //             {field.label || field.name}
    //             {field.required && <span className="text-primary font-bold">•</span>}
    //           </label>
    //           {renderInteractiveField(field, previewValues, setPreviewValues)}
    //           {field.helperText && (
    //             <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5 ml-1 select-none">
    //               <Info size={12} className="text-secondary shrink-0" />
    //               <span className="italic">{field.helperText}</span>
    //             </p>
    //           )}
    //         </div>
    //       ))}

    //       <Button
    //         type="submit"
    //         className="w-full h-12 bg-primary hover:bg-primary/95 text-white active:scale-[0.98] font-bold text-xs uppercase tracking-[2px] rounded-full mt-8 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10 transition-all duration-300"
    //       >
    //         <span>Submit Response</span>
    //         <Send size={14} className="transition-transform group-hover/button:translate-x-0.5" />
    //       </Button>
    //     </form>
    //   </div>
    // </div>
  );
}

