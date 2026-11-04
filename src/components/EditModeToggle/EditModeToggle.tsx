'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setEditMode } from '@/lib/store/pages/pagesSlice';
import { RootState } from '@/lib/store/store';
import { Pencil } from 'lucide-react';
import { getUserThunk } from '@/lib/store/auth/authThunks';

export default function EditModeToggle() {
  return null;
}
