import { create } from 'zustand';

export type CommentStatus = 'open' | 'pending' | 'done';
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'all';

export interface Annotation {
  id: string;
  pageId?: string;
  slug?: string;
  _id?: string;
  selector?: string;
  offsetX?: number; // Percentage 0-100
  offsetY?: number; // Percentage 0-100
  content?: string;
  status?: CommentStatus;
  screenSize?: ScreenSize;
  createdAt?: number;
}

export interface AnnotatorSettings {
  showResolved: boolean;
  calibrationMode: boolean;
}

interface AnnotatorStore {
  annotations: Annotation[];
  isCommentModeActive: boolean;
  activeAnnotationId: string | null;
  settings: AnnotatorSettings;
  toggleCommentMode: () => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotationStatus: (id: string, status: CommentStatus) => void;
  updateAnnotationScreen: (id: string, screenSize: ScreenSize) => void;
  updateAnnotationPosition: (id: string, selector: string, offsetX: number, offsetY: number) => void;
  setActiveAnnotationId: (id: string | null) => void;
  updateSettings: (settings: Partial<AnnotatorSettings>) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

const getAnnotationKey = (annotation: Annotation) => annotation._id ?? annotation.id;

export const useAnnotatorStore = create<AnnotatorStore>()((set) => ({
  annotations: [],
  isCommentModeActive: false,
  activeAnnotationId: null,
  settings: {
    showResolved: true,
    calibrationMode: false,
  },
  
  toggleCommentMode: () => set((state) => ({ 
    isCommentModeActive: !state.isCommentModeActive, 
    activeAnnotationId: null 
  })),
  
  addAnnotation: (annotation) => set((state) => ({
    annotations: [
      ...state.annotations,
      {
        ...annotation,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
      }
    ]
  })),
  
  setAnnotations: (annotations: Annotation[]) => set((state) => ({
    annotations: annotations
  })),
  removeAnnotation: (id) => set((state) => ({
    annotations: state.annotations.filter((a) => getAnnotationKey(a) !== id),
    activeAnnotationId: state.activeAnnotationId === id ? null : state.activeAnnotationId
  })),
  
  updateAnnotationStatus: (id, status) => set((state) => ({
    annotations: state.annotations.map((a) => getAnnotationKey(a) === id ? { ...a, status } : a)
  })),

  updateAnnotationScreen: (id, screenSize) => set((state) => ({
    annotations: state.annotations.map((a) => getAnnotationKey(a) === id ? { ...a, screenSize } : a)
  })),

  updateAnnotationPosition: (id, selector, offsetX, offsetY) => set((state) => ({
    annotations: state.annotations.map((a) => getAnnotationKey(a) === id ? { ...a, selector, offsetX, offsetY } : a)
  })),
  
  setActiveAnnotationId: (id) => set({ activeAnnotationId: id }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
}));
