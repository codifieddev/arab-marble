import type { Theme } from '@/lib/store/blueprint/blueprintType';

const injectGoogleFont = (family: string, id: string) => {
  if (typeof document === 'undefined') return;
  const cleanFamily = family.split(',')[0].trim().replace(/['"]/g, '');
  const existingLink = document.getElementById(id);
  if (existingLink) {
    if (!existingLink.getAttribute('href')?.includes(cleanFamily)) {
      existingLink.setAttribute('href', `https://fonts.googleapis.com/css2?family=${cleanFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`);
    }
    return;
  }
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${cleanFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
};

export const applyTheme = (theme: Theme | null, context: 'public' | 'admin' = 'public') => {
  if (typeof document === 'undefined' || !theme) return;
  const root = document.documentElement;
  
  const colors = theme.colors || ({} as any);
  const coreColors = (colors as any).core || colors;
  const typography = theme.typography || ({} as any);
  const text = typography.text || ({} as any);
  const fw = typography.fw || ({} as any);
  const lineHeight = typography.lineHeight || ({} as any);
  const spacing = theme.spacing || ({} as any);
  const radius = theme.radius || ({} as any);
  const shadow = theme.shadow || ({} as any);
  const layout = theme.layout || ({} as any);
  const buttons = { ...(theme.buttons || {}), ...((colors as any).buttons || {}) } as any;
  const forms = { ...(theme.forms || {}), ...((colors as any).forms || {}) } as any;
  const modal = { ...(theme.modal || {}), ...((colors as any).modal || {}) } as any;

  const cssVars: Record<string, string> = {
    '--primary': coreColors.primary || '#D9547A',
    '--primary-light': colors.primaryLight || coreColors.primary || '#E8899F',
    '--primary-dark': colors.primaryDark || coreColors.primary || '#B83A60',
    '--primary-hover': colors.primaryHover || coreColors.primary || '#C04A6E',
    '--secondary': coreColors.secondary || '#5A8C54',
    '--accent': coreColors.accent || '#C4B5D4',
    '--accent-hover': colors.accentHover || coreColors.accent || '#B09CC4',
    '--accent-soft': colors.accentSoft || '#FDF7EF',
    '--background': coreColors.background || '#FDF7EF',
    '--surface': coreColors.surface || '#FFFFFF',
    '--card': colors.card || coreColors.surface || '#FFFFFF',
    '--text': coreColors.text || '#3D2E2E',
    '--text-secondary': colors.textSecondary || coreColors.text || '#6B5555',
    '--text-muted': colors.textMuted || coreColors.text || '#A49090',
    '--border': colors.border || '#F5EDE0',
    '--border-hover': colors.borderHover || colors.border || '#E0D8EC',
    '--success': colors.success || '#5A8C54',
    '--warning': colors.warning || '#E8899F',
    '--error': colors.error || colors.danger || '#D9547A',
    '--info': colors.info || '#C4B5D4',
    '--overlay': colors.overlay || 'rgba(61,46,46,0.65)',
    '--font-body': typography.bodyFont || "'Nunito', sans-serif",
    '--font-heading': typography.headingFont || "'DM Serif Display', Georgia, serif",
    '--font-mono': typography.monoFont || "'JetBrains Mono', monospace",
    '--text-xs': text.xs,
    '--text-sm': text.sm,
    '--text-base': text.base,
    '--text-md': text.md,
    '--text-lg': text.lg,
    '--text-xl': text.xl,
    '--text-2xl': text['2xl'],
    '--text-3xl': text['3xl'],
    '--text-4xl': text['4xl'],
    '--text-5xl': text['5xl'],
    '--fw-light': fw.light,
    '--fw-normal': fw.normal,
    '--fw-medium': fw.medium,
    '--fw-semibold': fw.semibold,
    '--fw-bold': fw.bold,
    '--fw-extrabold': fw.extrabold,
    '--leading-tight': lineHeight.tight,
    '--leading-normal': lineHeight.normal,
    '--leading-relaxed': lineHeight.relaxed,
    '--space-1': spacing['1'],
    '--space-2': spacing['2'],
    '--space-3': spacing['3'],
    '--space-4': spacing['4'],
    '--space-5': spacing['5'],
    '--space-6': spacing['6'],
    '--space-8': spacing['8'],
    '--space-10': spacing['10'],
    '--space-12': spacing['12'],
    '--space-16': spacing['16'],
    '--space-20': spacing['20'],
    '--space-24': spacing['24'],
    '--radius-sm': radius.sm,
    '--radius-md': radius.md,
    '--radius-lg': radius.lg,
    '--radius-xl': radius.xl,
    '--radius-2xl': radius['2xl'],
    '--radius-full': radius.full,
    '--shadow-sm': shadow.sm,
    '--shadow-md': shadow.md,
    '--shadow-lg': shadow.lg,
    '--shadow-hover': shadow.hover,
    '--container': layout.container,
    '--navbar-height': layout.navbarHeight,
    '--section-padding': layout.sectionPadding,
    '--btn-height': buttons.height,
    '--btn-padding-x': buttons.paddingX,
    '--btn-radius': buttons.radius,
    '--btn-primary-bg': buttons.primary || buttons.primaryBackground,
    '--btn-primary-text': buttons.primaryText,
    '--btn-primary-hover': buttons.primaryHover || coreColors.primary,
    '--btn-secondary-bg': buttons.secondary || buttons.secondaryBackground,
    '--btn-secondary-text': buttons.secondaryText,
    '--btn-secondary-hover': buttons.secondaryHover || coreColors.secondary,
    '--btn-outline-border': buttons.outlineBorder,
    '--btn-outline-text': buttons.outlineText,
    '--btn-outline-hover-bg': buttons.outlineHoverBg || coreColors.primary,
    '--btn-outline-hover-text': buttons.outlineHoverText,
    '--input-height': forms.inputHeight,
    '--input-padding-x': forms.inputPaddingX,
    '--input-padding-y': forms.inputPaddingY,
    '--input-radius': forms.inputRadius,
    '--input-bg': forms.inputBackground,
    '--input-text': forms.inputText,
    '--input-border': forms.inputBorder,
    '--input-border-hover': forms.inputBorderHover,
    '--input-placeholder': forms.inputPlaceholder,
    '--input-focus-border': forms.inputFocusBorder,
    '--input-focus-shadow': forms.inputFocusShadow,
    '--input-disabled-bg': forms.inputDisabledBackground,
    '--input-disabled-text': forms.inputDisabledText,
    '--textarea-min-height': forms.textareaMinHeight,
    '--modal-sm': modal.sm,
    '--modal-md': modal.md,
    '--modal-lg': modal.lg,
  };

  Object.entries(cssVars).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      root.style.setProperty(key, value);
    }
  });

  if (typography.bodyFont) injectGoogleFont(typography.bodyFont, 'blueprint-body-font');
  if (typography.headingFont) injectGoogleFont(typography.headingFont, 'blueprint-heading-font');
};

export default applyTheme;
