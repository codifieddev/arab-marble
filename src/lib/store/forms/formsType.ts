export type { FormField, FormRecord as FormsData } from './formsSlice';

export interface FormSubmit {
  id?: string;
  formId: string;
  data: Record<string, unknown>;
}
