"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import FormPreviewTab from "./FormPreview";
import { useEffect, useState } from "react";
import { FormField } from "@/lib/store/forms/formsType";
import { toast } from "sonner";
import { subMitFormData } from "@/lib/store/forms/formsThunk";

export const FormComp = () => {
  const { allForms } = useAppSelector((state) => state.forms);
  const formId = "6a33915780b4f6a585e55d37";
  const [fields, setFields] = useState<FormField[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!formId && allForms.length == 0) return;
    const form = allForms.find((d) => d.id == formId);
    if (!form || form == undefined || !form.settings || !form.fields) return;
    setFields(form.fields as FormField[]);
    setSuccessMessage(form.settings.successMessage ?? "");
    const defaultValues: Record<string, any> = {};
    form.fields.forEach((field: FormField) => {
      defaultValues[field.name] = "";
    });
    setPreviewValues(defaultValues);
  }, [allForms]);

  const handlePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tId = toast.loading("Submitting response...");
      const payload = {
        formId: formId,
        data: previewValues,
      };
      const res = await dispatch(subMitFormData(payload)).unwrap();
      if (res.id) {
        setIsSubmitted(true);
        toast.success(successMessage || "Form submitted successfully", {
          id: tId,
        });
        setPreviewValues({});
      }
    } catch (err: any) {
      toast.error(err || "Failed to submit form");
    }
  };

  return (
    <div>
      <FormPreviewTab
        fields={fields}
        successMessage={successMessage}
        previewValues={previewValues}
        setPreviewValues={setPreviewValues}
        isSubmitted={isSubmitted}
        handlePreviewSubmit={handlePreviewSubmit}
      />
    </div>
  );
};
