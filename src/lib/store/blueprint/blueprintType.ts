export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderHover: string;
  success: string;
  warning: string;
  error: string;
  danger?: string;
  info: string;
  overlay: string;
  core?: Partial<ThemeColors>;
  buttons?: Partial<ThemeButtons>;
  forms?: Partial<ThemeForms>;
  modal?: Partial<ThemeModal>;
}

export interface ThemeTypographyText {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
}

export interface ThemeTypographyFw {
  light: string;
  normal: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
}

export interface ThemeTypographyLineHeight {
  tight: string;
  normal: string;
  relaxed: string;
}

export interface ThemeTypography {
  bodyFont: string;
  headingFont: string;
  monoFont: string;
  customFonts?: Array<{
    id?: string;
    name: string;
    url: string;
    weight?: string;
    style?: string;
  }>;
  text: ThemeTypographyText;
  fw: ThemeTypographyFw;
  lineHeight: ThemeTypographyLineHeight;
}

export interface ThemeSpacing {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
  "6": string;
  "8": string;
  "10": string;
  "12": string;
  "16": string;
  "20": string;
  "24": string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  full: string;
}

export interface ThemeShadow {
  sm: string;
  md: string;
  lg: string;
  hover: string;
}

export interface ThemeLayout {
  container: string;
  navbarHeight: string;
  sectionPadding: string;
}

export interface ThemeButtons {
  height: string;
  paddingX: string;
  radius: string;
  primaryBackground: string;
  primaryText: string;
  primaryHover: string;
  secondaryBackground: string;
  secondaryText: string;
  secondaryHover: string;
  outlineBorder: string;
  outlineText: string;
  outlineHoverBg: string;
  outlineHoverText: string;
}

export interface ThemeForms {
  inputHeight: string;
  inputPaddingX: string;
  inputPaddingY: string;
  inputRadius: string;
  inputBackground: string;
  inputText: string;
  inputBorder: string;
  inputBorderHover: string;
  inputPlaceholder: string;
  inputFocusBorder: string;
  inputFocusShadow: string;
  inputDisabledBackground: string;
  inputDisabledText: string;
  textareaMinHeight: string;
}

export interface ThemeModal {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeDarkMode {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBackground: string;
  inputText: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputDisabledBackground: string;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  layout: ThemeLayout;
  buttons: ThemeButtons;
  forms: ThemeForms;
  modal: ThemeModal;
  darkMode: ThemeDarkMode;
}

export interface NavItem {
  label: {
    en: string;
    hi?: string;
  };
  href: string;
  dropdownItems?: NavItem[];
}

export interface RouteDefinition {
  path: string;
  component: string;
  isProtected: boolean;
  roles?: string[];
}

export interface BrandValue {
  title: {
    en: string;
    hi?: string;
  };
  description: {
    en: string;
    hi?: string;
  };
  icon?: string;
}

export interface BrandTaglines {
  primary: {
    en: string;
    hi?: string;
  };
  secondary?: {
    en: string;
    hi?: string;
  };
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface BusinessProfile {
  name: {
    en: string;
    hi?: string;
  };
  tagline: BrandTaglines;
  logo?: string;
  favicon?: string;
  description?: {
    en: string;
    hi?: string;
  };
  foundedYear?: number;
  headquarters?: string;
  values: BrandValue[];
  socialLinks: SocialLink[];
}

export interface BusinessInfo {
  legalName: string;
  registrationNumber?: string;
  taxId?: string;
  gst?: string;
}

export interface BusinessCommunications {
  phone: string;
  email: string;
  whatsapp?: string;
  supportEmail?: string;
}

export interface BusinessContactInfo {
  address: {
    en: string;
    hi?: string;
  };
  phone: string;
  email: string;
  whatsapp?: string;
  mapLocation?: {
    lat: number;
    lng: number;
  };
}

export interface BusinessLegalRegulatory {
  termsUrl: string;
  privacyUrl: string;
  returnsUrl: string;
  shippingPolicyUrl?: string;
}

export interface Commerce {
  currencyCode: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  taxRate: number;
  shippingCost: number;
  enabledPaymentMethods: string[];
  enabledShippingMethods: Array<{
    id: string;
    name: {
      en: string;
      hi?: string;
    };
    cost: number;
    minOrderValue?: number;
  }>;
  shippingRegions?: {
    zones?: Array<{
      regions: string[];
      flatRate: number;
      [key: string]: any;
    }>;
    freeShipping?: {
      threshold: number;
      [key: string]: any;
    };
  };
  paymentProviders?: {
    gateways?: Array<{
      id: string;
      enabled: boolean;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  checkoutPolicies?: any;
  currenciesTaxes?: {
    tax?: {
      taxRules?: Array<{
        region: string;
        rate: number;
        inclusive: boolean;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface Localization {
  activeLanguages?: string[];
  languages?: Array<{ code: string; name?: string; enabled?: boolean }>;
  defaultLanguage: string;
  activeCurrencies?: Array<{
    code: string;
    symbol: string;
  }>;
  currencies?: Array<{
    code: string;
    symbol?: string;
    enabled?: boolean;
  }>;
  defaultCurrency: string;
  timezone?: string;
  country?: string;
  exchangeRates?: Record<string, number>;
}

export interface MediaConfiguration {
  maxFileSize: number;
  allowedImageTypes: string[];
  imageQuality: number;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: {
    en: string;
    hi?: string;
  };
  config: Record<string, any>;
}

export interface Vocabulary {
  [key: string]: {
    en: string;
    hi?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  sections: any[];
}

export interface ToneTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface PrimaryGoal {
  id: string;
  name: string;
  description?: string;
  metrics: string[];
}

export interface Navigation {
  public: NavItem[];
  admin?: NavItem[];
}

export interface Routes {
  public: RouteDefinition[];
  protected: RouteDefinition[];
  admin?: RouteDefinition[];
}

export interface EnabledModules {
  ecommerce: boolean;
  blog: boolean;
  portfolio: boolean;
  team: boolean;
  careers: boolean;
}

export interface BlueprintPayload {
  id: string;
  document_key: string;
  business_profile: BusinessProfile;
  business_info: BusinessInfo;
  business_communications: BusinessCommunications;
  business_contact_info: BusinessContactInfo;
  business_legal_regulatory: BusinessLegalRegulatory;
  public_theme: Theme;
  admin_theme: Theme;
  public_navigation: Navigation;
  admin_navigation: Navigation;
  routes: Routes;
  commerce: Commerce;
  localization: Localization;
  media_configuration: MediaConfiguration;
  dashboard_widgets: DashboardWidget[];
  vocabulary: Vocabulary;
  templates: Template[];
  tone_tags: ToneTag[];
  primary_goals: PrimaryGoal[];
  enabled_modules: EnabledModules;
  header?: any;
  [key: string]: any;
  created_at: string;
  updated_at: string;
}

export interface BlueprintApiResponse {
  message: string;
  success: boolean;
  data: {
    id: string;
    document_key: string;
    payload: BlueprintPayload;
  };
}

export type ThemeContext = 'public' | 'admin';

export interface BlueprintState {
  payload: BlueprintPayload | null;
  activeThemeContext: ThemeContext;
  loading: boolean;
  updating: boolean;
  error: string | null;
  lastFetched: string | null;
}
