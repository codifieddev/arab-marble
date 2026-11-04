export interface LocalizedText {
  en?: string;
  hi?: string;
  [key: string]: string | undefined;
}

export interface ContentItem {
  id?: string;
  type: string;
  props?: any;
  content?: any[];
  _id?: string;
}

export interface PageBlock {
  id: string;
  type: string;
  props?: any;
  layout: string;
  adminTitle?: string;
  content?: (PageBlock | ContentItem | any)[];
  columns?: any[][];
}

export interface Page {
  _id?: string;
  title: LocalizedText;
  slug: string;
  content?: PageBlock[] | string | any;
  blocks?: PageBlock[] | string | any;
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  isPublished: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  status?: string;
  type?: string;
  template?: string;
  isHomepage?: boolean;
  isHome?: boolean;
  isHomePage?: boolean;
}

export interface PagesState {
  allPages: Page[];
  currentPages: Page | null;
  originalPageBackup?: Page | null;
  isAllPageFetched: boolean;
  isError: boolean;
  isLoading: boolean;
  isSaving?: boolean;
  isEditablePage: boolean;
  isEditable: boolean;
  hasUnsavedChanges?: boolean;
}
