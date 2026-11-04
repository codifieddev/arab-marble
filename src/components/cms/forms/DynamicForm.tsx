'use client';

import DynamicCanvasForm, { DynamicCanvasFormProps } from '@/components/forms/DynamicCanvasForm';

export { DynamicCanvasForm };
export type { DynamicCanvasFormProps };

interface LegacyDynamicFormProps {
  formSlug: string;
  formId?: string;
  heading?: string;
  subheading?: string;
  submitButtonText?: string;
  successMessage?: string;
  className?: string;
}

export const DynamicForm = ({ formSlug, formId, heading, subheading, submitButtonText, successMessage, className }: LegacyDynamicFormProps) => {
  return (
    <DynamicCanvasForm
      formSlug={formSlug}
      formId={formId}
      heading={heading}
      subheading={subheading}
      submitButtonText={submitButtonText}
      successMessage={successMessage}
      className={className}
    />
  );
};

export default DynamicForm;
