import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import '@/styles/globals.css';
import ReduxProvider from '@/providers/ReduxProvider';
import BlueprintProvider from '@/components/providers/BlueprintProvider';
import CommerceBootstrap from '@/components/commerce/CommerceBootstrap';
import { getBlueprintLocalization, getBrandAssets } from '@/lib/blueprint-server';
import { getTenantPermalinkConfig } from '@/lib/permalink/resolver';
import { setRuntimePermalinkConfig } from '@/lib/permalink/url-helper';
import StoreLayoutShell from '@/components/layout/StoreLayoutShell';
import Script from 'next/script';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto-sans',
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale = 'en' } = await params;
  const [{ defaultLanguage, supportedLanguages }, { faviconUrl, brandName }] = await Promise.all([
    getBlueprintLocalization(),
    getBrandAssets(),
  ]);

  const isMultilingual = supportedLanguages.length > 1;

  const alternates: Metadata['alternates'] = {
    canonical: locale === defaultLanguage ? '/' : `/${locale}`,
  };

  if (isMultilingual) {
    const languages: Record<string, string> = {
      'x-default': '/',
    };
    for (const lang of supportedLanguages) {
      languages[lang] = lang === defaultLanguage ? '/' : `/${lang}`;
    }
    alternates.languages = languages;
  }

  return {
    title: `${brandName || 'Arab Marble'} - Natural Stones & Marble Abu Dhabi`,
    description:
      'Leading supplier and fixing contractor for premium marble, granite and natural stones in Abu Dhabi, UAE since 1973.',
    alternates,
    icons: {
      icon: faviconUrl || '/images/arab-marble-logo.svg',
      shortcut: faviconUrl || '/images/arab-marble-logo.svg',
      apple: faviconUrl || '/images/arab-marble-logo.svg',
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale = 'en' } = await params;
  const [{ defaultLanguage }, brandAssets, permalinkConfig] = await Promise.all([
    getBlueprintLocalization(),
    getBrandAssets(),
    getTenantPermalinkConfig(),
  ]);
  const localePrefix = locale === defaultLanguage ? '' : `/${locale}`;
  setRuntimePermalinkConfig(permalinkConfig);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="icon" href={brandAssets.faviconUrl || '/images/arab-marble-logo.svg'} />
        <link rel="shortcut icon" href={brandAssets.faviconUrl || '/images/arab-marble-logo.svg'} />
        <link rel="apple-touch-icon" href={brandAssets.faviconUrl || '/images/arab-marble-logo.svg'} />
      </head>
      <body className={`${notoSans.variable} min-h-screen flex flex-col`}>
        <Script
          id="permalink-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__PERMALINK_CONFIG__ = ${JSON.stringify(permalinkConfig)};`,
          }}
        />
        <ReduxProvider>
          <CommerceBootstrap />
          <BlueprintProvider
            context="public"
            initialPermalinkConfig={permalinkConfig}
            initialBrandAssets={brandAssets}
          >
            <StoreLayoutShell
              locale={locale}
              localePrefix={localePrefix}
              initialBrandAssets={brandAssets}
            >
              {children}
            </StoreLayoutShell>
          </BlueprintProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
