'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Link2,
  CalendarDays,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  ShieldCheck,
  ToggleLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Settings2,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Sliders,
  Send,
  MessageSquare,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import styles from './canvas-form-builder.module.css';

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'terms'
  | 'boolean'
  | 'media';

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  helperText?: string;
  options?: string[];
}

export interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  replyTo: string;
  cc?: string;
  bcc?: string;
  body: string;
}

export interface FormSettings {
  purpose?: 'lead_enquiry' | 'service_request' | 'support_complaint' | 'feedback' | 'general_contact';
  sendEmail: boolean;
  email: EmailTemplate;
  successMessage: string;
  submitButtonText?: string;
}

export interface FormsData {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  fields?: FormField[];
  settings?: FormSettings;
}

export const defaultEmailTemplate: EmailTemplate = {
  to: 'am@arabmarble.ae',
  from: 'am@arabmarble.ae',
  subject: 'New form submission',
  replyTo: 'am@arabmarble.ae',
  cc: '',
  bcc: '',
  body: '',
};

export const defaultFormSettings: FormSettings = {
  purpose: 'general_contact',
  sendEmail: false,
  email: { ...defaultEmailTemplate },
  successMessage: 'Thanks! Your response has been recorded.',
};

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text: <Type size={14} />,
  textarea: <AlignLeft size={14} />,
  number: <Hash size={14} />,
  email: <Mail size={14} />,
  phone: <Phone size={14} />,
  url: <Link2 size={14} />,
  date: <CalendarDays size={14} />,
  select: <ChevronDownSquare size={14} />,
  radio: <CircleDot size={14} />,
  checkbox: <CheckSquare size={14} />,
  terms: <ShieldCheck size={14} />,
  boolean: <ToggleLeft size={14} />,
  media: <ImageIcon size={14} />,
};

const FIELD_LIBRARY: {
  group: string;
  items: { type: FieldType; label: string; desc: string }[];
}[] = [
  {
    group: 'Basics',
    items: [
      { type: 'text', label: 'Short Text', desc: 'Single-line input' },
      { type: 'textarea', label: 'Long Text', desc: 'Multi-line message' },
      { type: 'number', label: 'Number', desc: 'Numeric value' },
      { type: 'date', label: 'Date', desc: 'Date selector' },
    ],
  },
  {
    group: 'Contact',
    items: [
      { type: 'email', label: 'Email', desc: 'Email address' },
      { type: 'phone', label: 'Phone', desc: 'Phone number' },
      { type: 'url', label: 'Website', desc: 'URL link' },
    ],
  },
  {
    group: 'Choices',
    items: [
      { type: 'select', label: 'Dropdown', desc: 'Single pick dropdown' },
      { type: 'radio', label: 'Radio Group', desc: 'Pick one from options' },
      { type: 'checkbox', label: 'Checkbox', desc: 'Single checkbox toggle' },
      { type: 'terms', label: 'Consent Terms', desc: 'Mandatory agreement' },
    ],
  },
  {
    group: 'Advanced',
    items: [
      { type: 'boolean', label: 'Switch', desc: 'Yes / No toggle' },
      { type: 'media', label: 'Media Upload', desc: 'File or image upload' },
    ],
  },
];

const HAS_OPTIONS: FieldType[] = ['select', 'radio'];

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const buildDefaultBody = (fields: FormField[]) => {
  const lines = fields
    .filter((f) => f.name)
    .map((f) => `${f.label || f.name}: [${f.name}]`)
    .join('\n');
  return `You received a new submission:\n\n${lines}\n\n--\nSubmitted via website form.`;
};

export interface CanvasFormModalProps {
  initialData?: any;
  isLoading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: any) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export default function CanvasFormModal({
  initialData,
  isLoading = false,
  onCancel,
  onSubmit,
  onDelete,
}: CanvasFormModalProps) {
  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'preview'>('fields');

  const initialForm = useMemo(() => {
    if (!initialData) return null;
    const p = initialData.props || initialData;
    const name = p.name || p.title || p.formHeading || p.heading || 'Contact & Inquiry Form';
    const fields = p.fields || initialData.fields || [];
    const settings = p.settings || initialData.settings || null;
    return {
      id: initialData.id || initialData._id || p.id || p._id,
      _id: initialData._id || initialData.id || p._id || p.id,
      name,
      slug: initialData.slug || p.slug || 'contact-inquiry-form',
      fields,
      settings,
    };
  }, [initialData]);

  const [formName, setFormName] = useState(initialForm?.name || 'Contact & Inquiry Form');
  const [fields, setFields] = useState<FormField[]>(() => {
    if (initialForm?.fields && initialForm.fields.length > 0) {
      return initialForm.fields;
    }
    return [
      { id: 'f-name', type: 'text', name: 'name', label: 'Name', placeholder: 'Your Name', required: true },
      { id: 'f-email', type: 'email', name: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
      { id: 'f-phone', type: 'phone', name: 'phone', label: 'Phone Number', placeholder: '+971 50 123 4567', required: false },
      {
        id: 'f-stone',
        type: 'select',
        name: 'product_interest',
        label: 'Stone of Interest',
        required: false,
        options: ['Crema Marfil', 'Light Emperador', "Cat's Eye", 'Calacatta Oro', 'Custom Project Stone'],
      },
      { id: 'f-msg', type: 'textarea', name: 'message', label: 'Message', placeholder: 'Tell us about your project...', required: true },
    ];
  });

  const [settings, setSettings] = useState<FormSettings>(() => {
    if (initialForm?.settings) {
      return {
        ...defaultFormSettings,
        ...initialForm.settings,
        email: { ...defaultEmailTemplate, ...initialForm.settings.email },
      };
    }
    return defaultFormSettings;
  });

  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const bizEmail = 'am@arabmarble.ae';

  // If initialForm updates from async parent
  useEffect(() => {
    if (initialForm) {
      if (initialForm.name) setFormName(initialForm.name);
      if (initialForm.fields && initialForm.fields.length > 0) setFields(initialForm.fields);
      if (initialForm.settings) {
        setSettings({
          ...defaultFormSettings,
          ...initialForm.settings,
          email: { ...defaultEmailTemplate, ...initialForm.settings.email },
        });
      }
    }
  }, [initialForm]);

  useEffect(() => {
    if (settings.sendEmail) {
      let changed = false;
      const email = { ...settings.email };
      if (!email.to) {
        email.to = bizEmail || '[email]';
        changed = true;
      }
      if (!email.from && bizEmail) {
        email.from = bizEmail;
        changed = true;
      }
      if (!email.replyTo && bizEmail) {
        email.replyTo = bizEmail;
        changed = true;
      }
      if (changed) {
        setSettings((s) => ({ ...s, email }));
      }
    }
  }, [settings.sendEmail]);

  /* Field Actions */
  const addField = (type: FieldType) => {
    const id = `field-${Date.now()}`;
    const meta = FIELD_LIBRARY.flatMap((g) => g.items).find((i) => i.type === type);
    const newField: FormField = {
      id,
      type,
      name: `${type}_${fields.length + 1}`,
      label: meta?.label || 'New Field',
      placeholder: '',
      required: type === 'terms',
      options: HAS_OPTIONS.includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };
    setFields((prev) => [...prev, newField]);
    setExpandedFieldId(id);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (expandedFieldId === id) setExpandedFieldId(null);
  };

  const duplicateField = (id: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const src = prev[idx];
      const copy: FormField = {
        ...src,
        id: `field-${Date.now()}`,
        name: `${src.name}_copy`,
        label: `${src.label} (copy)`,
        options: src.options ? [...src.options] : undefined,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;
    setFields((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateOption = (fieldId: string, optIdx: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field?.options) return;
    const options = [...field.options];
    options[optIdx] = value;
    updateField(fieldId, { options });
  };

  /* Email Settings Helpers */
  const updateEmail = (updates: Partial<FormSettings['email']>) => {
    setSettings((s) => ({ ...s, email: { ...s.email, ...updates } }));
  };

  const mailTags = useMemo(() => {
    return [
      ...fields.filter((f) => f.name).map((f) => `[${f.name}]`),
      '[all_fields]',
      '[form_name]',
    ];
  }, [fields]);

  const insertTag = (tag: string) => {
    const ta = bodyRef.current;
    const body = settings.email.body || '';
    if (!ta) {
      updateEmail({ body: body + tag });
      return;
    }
    const start = ta.selectionStart ?? body.length;
    const end = ta.selectionEnd ?? body.length;
    const next = body.slice(0, start) + tag + body.slice(end);
    updateEmail({ body: next });
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + tag.length;
    });
  };

  const resetTemplate = () => {
    updateEmail({
      to: bizEmail || '[email]',
      from: bizEmail,
      subject: `New submission${formName ? ` — ${formName}` : ''}`,
      replyTo: bizEmail,
      cc: '',
      bcc: '',
      body: buildDefaultBody(fields),
    });
  };

  /* Validation */
  const emailToInvalid =
    settings.sendEmail &&
    !settings.email.to
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .every((s) => isValidEmail(s) || (s.startsWith('[') && s.endsWith(']')));

  const emailBodyMissing = settings.sendEmail && !settings.email.body.trim();

  const handleSave = async () => {
    if (!formName.trim()) {
      setErrorMessage('Please enter a name for the form.');
      return;
    }
    if (fields.length === 0) {
      setErrorMessage('Please add at least one field to the form.');
      return;
    }
    if (emailToInvalid) {
      setErrorMessage('Email settings: Please enter valid recipient email address(es).');
      return;
    }
    if (emailBodyMissing) {
      setErrorMessage('Email settings: Message body is required.');
      return;
    }

    setErrorMessage('');
    const payload = {
      id: initialForm?.id || initialForm?._id,
      _id: initialForm?._id || initialForm?.id,
      name: formName.trim(),
      title: formName.trim(),
      heading: formName.trim(),
      formHeading: formName.trim(),
      slug: initialForm?.slug || 'contact-inquiry-form',
      purpose: settings.purpose,
      fields,
      settings,
      buttonLabel: settings.submitButtonText || 'Send Message',
      buttonText: settings.submitButtonText || 'Send Message',
      submitButtonText: settings.submitButtonText || 'Send Message',
      successMessage: settings.successMessage,
      recipientEmail: settings.email.to,
    };

    await onSubmit(payload);
  };

  return (
    <div className={styles.formContainer}>
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#0e121a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Settings2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CANVAS FORM BUILDER
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <Sparkles size={11} /> Live Reflect
              </span>
            </div>
            <h2 className="text-sm font-bold text-white mt-0.5">{formName || 'Interactive Form'}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Navigation tabs */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'fields' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          <Layers size={13} />
          Fields <span className={styles.badge}>{fields.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Sliders size={13} />
          Settings &amp; Email
          {settings.sendEmail && <span className={styles.badge}>Email On</span>}
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={13} />
          Live Preview
        </button>
      </div>

      {/* Main scrollable body */}
      <div className={styles.scrollArea}>
        {errorMessage && (
          <p className={styles.errorBanner} role="alert">
            {errorMessage}
          </p>
        )}

        {/* Tab 1: Fields & Form Name */}
        {activeTab === 'fields' && (
          <>
            {/* Form General Info Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Settings2 />
                  Form Configuration
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Form Name <span style={{ color: 'var(--admin-desktop-accent)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Contact Us, Stone Inquiry"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Submission Purpose</label>
                    <select
                      className={styles.select}
                      value={settings.purpose || 'general_contact'}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          purpose: e.target.value as FormSettings['purpose'],
                        }))
                      }
                    >
                      <option value="lead_enquiry">Lead / Enquiry (Routes to Leads)</option>
                      <option value="service_request">Service Request</option>
                      <option value="support_complaint">Complaint / Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="general_contact">General Contact</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Library Palette Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Plus />
                  Add Field to Form
                </div>
              </div>
              <div className={styles.cardBody} style={{ gap: 14 }}>
                {FIELD_LIBRARY.map((grp) => (
                  <div key={grp.group} className={styles.paletteGroup}>
                    <span className={styles.paletteGroupTitle}>{grp.group}</span>
                    <div className={styles.paletteGrid}>
                      {grp.items.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          className={styles.paletteButton}
                          onClick={() => addField(item.type)}
                          title={item.desc}
                        >
                          <span className={styles.paletteIconWrap}>
                            {FIELD_ICONS[item.type]}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields List Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Layers />
                  Form Fields ({fields.length})
                </div>
              </div>
              <div className={styles.cardBody}>
                {fields.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Plus size={24} style={{ color: 'var(--admin-desktop-muted)' }} />
                    <span className={styles.emptyStateTitle}>No Fields Added Yet</span>
                    <p className={styles.hint}>
                      Click any field in the library above to add it to your form.
                    </p>
                  </div>
                ) : (
                  <div className={styles.fieldsList}>
                    {fields.map((field, idx) => {
                      const isExpanded = expandedFieldId === field.id;
                      return (
                        <div
                          key={field.id}
                          className={`${styles.fieldItem} ${isExpanded ? styles.fieldItemActive : ''}`}
                        >
                          <div className={styles.fieldItemHeader}>
                            <button
                              type="button"
                              className={styles.fieldItemToggle}
                              onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                              aria-label={isExpanded ? 'Collapse field' : 'Expand field'}
                            >
                              <ChevronRight
                                size={14}
                                style={{
                                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                                  transition: 'transform 0.15s ease',
                                }}
                              />
                            </button>

                            <div className={styles.fieldTypeIcon}>
                              {FIELD_ICONS[field.type]}
                            </div>

                            <div className={styles.fieldItemTitleArea}>
                              <input
                                type="text"
                                className={styles.fieldLabelInput}
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Field Label"
                              />
                              <div className={styles.fieldItemMeta}>
                                <span>{field.type}</span>
                                <span>·</span>
                                <code>{field.name}</code>
                                {field.required && (
                                  <span className={styles.fieldItemRequiredBadge}>Required</span>
                                )}
                              </div>
                            </div>

                            <div className={styles.fieldItemActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => moveField(idx, 'up')}
                                disabled={idx === 0}
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => moveField(idx, 'down')}
                                disabled={idx === fields.length - 1}
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => duplicateField(field.id)}
                                title="Duplicate field"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => removeField(field.id)}
                                title="Delete field"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className={styles.fieldExpandedArea}>
                              <div className={styles.grid2}>
                                <div className={styles.fieldGroup}>
                                  <label className={styles.label}>Internal Key (Variable Name)</label>
                                  <input
                                    type="text"
                                    className={styles.input}
                                    value={field.name}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                                      })
                                    }
                                    placeholder="e.g. first_name"
                                  />
                                  <p className={styles.hint}>
                                    Used in email templates as <code>[{field.name}]</code>
                                  </p>
                                </div>

                                {field.type !== 'checkbox' && field.type !== 'terms' && field.type !== 'boolean' && (
                                  <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Placeholder Text</label>
                                    <input
                                      type="text"
                                      className={styles.input}
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                      placeholder="e.g. Enter your name..."
                                    />
                                  </div>
                                )}
                              </div>

                              <div className={styles.grid2}>
                                <div className={styles.fieldGroup}>
                                  <label className={styles.label}>Helper Text</label>
                                  <input
                                    type="text"
                                    className={styles.input}
                                    value={field.helperText || ''}
                                    onChange={(e) => updateField(field.id, { helperText: e.target.value })}
                                    placeholder="Optional guide text under the input"
                                  />
                                </div>

                                <div className={styles.fieldGroup} style={{ justifyContent: 'center' }}>
                                  <div className={styles.toggleRow}>
                                    <div>
                                      <strong style={{ fontSize: 12, display: 'block' }}>Mandatory Field</strong>
                                      <span className={styles.hint}>User must fill this to submit</span>
                                    </div>
                                    <label className={styles.switch}>
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                      />
                                      <span className={styles.slider} />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {HAS_OPTIONS.includes(field.type) && (
                                <div className={styles.fieldGroup}>
                                  <label className={styles.label}>Selection Options</label>
                                  <div className={styles.optionsList}>
                                    {(field.options || []).map((opt, optIdx) => (
                                      <div key={optIdx} className={styles.optionRow}>
                                        <input
                                          type="text"
                                          className={styles.input}
                                          value={opt}
                                          onChange={(e) => updateOption(field.id, optIdx, e.target.value)}
                                        />
                                        <button
                                          type="button"
                                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                          disabled={(field.options?.length || 0) <= 1}
                                          onClick={() =>
                                            updateField(field.id, {
                                              options: field.options!.filter((_, i) => i !== optIdx),
                                            })
                                          }
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      className={styles.addOptionBtn}
                                      onClick={() =>
                                        updateField(field.id, {
                                          options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`],
                                        })
                                      }
                                    >
                                      <Plus size={12} /> Add Option
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Settings & Email Notifications */}
        {activeTab === 'settings' && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <CheckCircle2 />
                  Submission Confirmation
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Success Message</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={settings.successMessage}
                    onChange={(e) => setSettings((s) => ({ ...s, successMessage: e.target.value }))}
                    placeholder="Thanks! Your response has been recorded."
                  />
                  <p className={styles.hint}>Displayed to visitors immediately after valid submission.</p>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Send />
                  Email Notifications
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.sendEmail}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        sendEmail: e.target.checked,
                      }))
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.cardBody}>
                {settings.sendEmail ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.hint}>
                        Configure who gets notified when a visitor submits this form.
                      </span>
                      <button
                        type="button"
                        className={styles.addOptionBtn}
                        onClick={resetTemplate}
                        style={{ margin: 0 }}
                      >
                        <RotateCcw size={12} /> Reset Template
                      </button>
                    </div>

                    <div className={styles.grid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                          To Email(s) <span style={{ color: 'var(--admin-desktop-accent)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.to}
                          onChange={(e) => updateEmail({ to: e.target.value })}
                          placeholder="e.g. sales@yourdomain.com, [email]"
                        />
                        <p className={styles.hint}>
                          Separate multiple recipients with commas. Use <code>[email]</code> to copy respondent.
                        </p>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>From Address</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.from}
                          onChange={(e) => updateEmail({ from: e.target.value })}
                          placeholder={bizEmail || 'noreply@yourdomain.com'}
                        />
                      </div>
                    </div>

                    <div className={styles.grid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email Subject</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.subject}
                          onChange={(e) => updateEmail({ subject: e.target.value })}
                          placeholder="New form submission"
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Reply-To</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.replyTo}
                          onChange={(e) => updateEmail({ replyTo: e.target.value })}
                          placeholder={bizEmail || 'noreply@yourdomain.com'}
                        />
                      </div>
                    </div>

                    <div className={styles.grid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>CC</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.cc || ''}
                          onChange={(e) => updateEmail({ cc: e.target.value })}
                          placeholder="Optional CC emails"
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>BCC</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={settings.email.bcc || ''}
                          onChange={(e) => updateEmail({ bcc: e.target.value })}
                          placeholder="Optional BCC emails"
                        />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>
                        Email Message Body <span style={{ color: 'var(--admin-desktop-accent)' }}>*</span>
                      </label>
                      <textarea
                        ref={bodyRef}
                        className={styles.textarea}
                        rows={7}
                        value={settings.email.body}
                        onChange={(e) => updateEmail({ body: e.target.value })}
                        placeholder="You received a new submission:&#10;&#10;[all_fields]"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>
                        <span>
                          <MessageSquare size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                          Insert Field Tags into Body
                        </span>
                      </label>
                      <div className={styles.tagsRow}>
                        {mailTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={styles.tagChip}
                            onClick={() => insertTag(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Send size={24} style={{ color: 'var(--admin-desktop-muted)' }} />
                    <span className={styles.emptyStateTitle}>Email Notifications are Off</span>
                    <p className={styles.hint}>
                      Turn on the switch above to automatically send submission emails to your team or customer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab 3: Interactive Live Preview */}
        {activeTab === 'preview' && (
          <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>{formName || 'Untitled Form'}</h3>
              <p className={styles.previewSubtitle}>Live interactive visitor preview</p>
            </div>

            {fields.length === 0 ? (
              <p className={styles.hint} style={{ textAlign: 'center', padding: 24 }}>
                Add some fields in the &quot;Fields&quot; tab to preview your form.
              </p>
            ) : (
              fields.map((field) => (
                <div key={field.id} className={styles.previewField}>
                  <label className={styles.previewLabel}>
                    {field.label}
                    {field.required && <span className={styles.previewRequired}>*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      className={styles.previewInput}
                      style={{ height: 80, padding: '8px 12px' }}
                      placeholder={field.placeholder || 'Your message here...'}
                    />
                  ) : field.type === 'select' ? (
                    <select className={styles.previewInput}>
                      <option value="">Select an option...</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {(field.options || []).map((opt, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input type="radio" name={field.name} value={opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' || field.type === 'terms' || field.type === 'boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" required={field.required} />
                      <span>{field.label || 'I agree to the terms'}</span>
                    </label>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      className={styles.previewInput}
                      placeholder={field.placeholder || ''}
                    />
                  )}

                  {field.helperText && <span className={styles.hint}>{field.helperText}</span>}
                </div>
              ))
            )}

            {fields.length > 0 && (
              <button
                type="button"
                className={styles.previewSubmitBtn}
                onClick={() => alert(`Preview test submitted! Success message: "${settings.successMessage}"`)}
              >
                Submit Form
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer / Action bar */}
      <div className={styles.footer}>
        {onDelete && (
          <div className={styles.footerLeft}>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={onDelete}
              disabled={isLoading}
            >
              <Trash2 size={13} /> Delete Form
            </button>
          </div>
        )}

        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSave}
          disabled={isLoading || !formName.trim() || fields.length === 0}
        >
          <Save size={14} />
          {isLoading ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </div>
  );
}
