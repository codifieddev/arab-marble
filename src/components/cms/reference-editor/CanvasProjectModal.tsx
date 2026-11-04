'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Type,
  MapPin,
  FolderTree,
  AlignLeft,
  ImageIcon,
  Save,
  X,
  Sparkles,
  Link2,
  ExternalLink,
} from 'lucide-react';
import styles from './canvas-product-form.module.css';

interface CanvasProjectModalProps {
  initialData?: any;
  onSubmit: (projectData: any) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORY_CHOICES = [
  'Latest Projects',
  'Iconic Landmark Projects',
  'Custom Projects',
  'Commercial Architecture',
  'Luxury Residential',
];

export default function CanvasProjectModal({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CanvasProjectModalProps) {
  const p = initialData || {};

  const [projectState, setProjectState] = useState({
    id: p.id || p._id || '',
    title: p.title || p.name || '',
    location: p.location || 'Abu Dhabi, UAE',
    category: p.category || 'Latest Projects',
    description:
      p.description ||
      'Execution of bespoke stonework, high-precision fixing, and premium marble installation for prominent architectural landmarks in the UAE.',
    image: p.image || p.imageUrl || '/images/project-boulevard-heights.jpg',
    ctaLabel: p.ctaLabel || 'Inquire on this Project →',
  });

  useEffect(() => {
    if (initialData) {
      setProjectState({
        id: initialData.id || initialData._id || '',
        title: initialData.title || initialData.name || '',
        location: initialData.location || 'Abu Dhabi, UAE',
        category: initialData.category || 'Latest Projects',
        description:
          initialData.description ||
          'Execution of bespoke stonework, high-precision fixing, and premium marble installation for prominent architectural landmarks in the UAE.',
        image: initialData.image || initialData.imageUrl || '/images/project-boulevard-heights.jpg',
        ctaLabel: initialData.ctaLabel || 'Inquire on this Project →',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(projectState);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PROJECT CANVAS
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <Sparkles size={11} /> Live Reflect
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              {projectState.title ? `Edit Project: ${projectState.title}` : 'Edit Project Details'}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scroll Area ────────────────────────────────────── */}
      <div className={styles.scrollArea}>
        {/* Card 1: Project Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <Type /> General Information
            </span>
            <span className={styles.keyTag}>project-meta</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={projectState.title}
                onChange={(e) => setProjectState((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Saadiyat Island Private Villa"
                className={styles.input}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Location / City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectState.location}
                    onChange={(e) => setProjectState((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Abu Dhabi, UAE"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Category</label>
                <select
                  value={projectState.category}
                  onChange={(e) => setProjectState((prev) => ({ ...prev, category: e.target.value }))}
                  className={styles.input}
                >
                  {CATEGORY_CHOICES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Description & Scope */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <AlignLeft /> Description & Scope of Work
            </span>
            <span className={styles.keyTag}>content</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Project Scope & Stone Details</label>
              <textarea
                rows={4}
                value={projectState.description}
                onChange={(e) => setProjectState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe stone fixing, supply type, marble variety, and architectural scope..."
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Inquiry Action CTA Label</label>
              <input
                type="text"
                value={projectState.ctaLabel}
                onChange={(e) => setProjectState((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                placeholder="Inquire on this Project →"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Visual Asset */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <ImageIcon /> Project Visual Asset
            </span>
            <span className={styles.keyTag}>media</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Image URL or Path</label>
              <input
                type="text"
                value={projectState.image}
                onChange={(e) => setProjectState((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="/images/project-boulevard-heights.jpg"
                className={styles.input}
              />
            </div>

            {/* Live Image Preview */}
            <div className="mt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Preview
              </span>
              <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#171b23]">
                <img
                  src={projectState.image}
                  alt={projectState.title || 'Project Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/project-boulevard-heights.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Action Bar ────────────────────────── */}
      <div className={styles.actionBar}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || !projectState.title.trim()}
          className={styles.submitBtn}
        >
          {isLoading ? (
            <div
              style={{
                width: '13px',
                height: '13px',
                border: '2px solid rgba(0,0,0,0.3)',
                borderTopColor: '#000',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <Save size={13} />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}

