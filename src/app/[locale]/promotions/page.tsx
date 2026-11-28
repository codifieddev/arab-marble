import { Metadata } from 'next';
import PromotionsSection from '@/components/cms/sections/PromotionsSection';

export const metadata: Metadata = {
  title: 'Promotions | Arab Marble',
  description: 'Exclusive offers on premium marble, granite and natural stones in Abu Dhabi, UAE.',
};

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale = 'en' } = await params;

  return (
    <div className="bg-white min-h-screen">
      {/* Light Stone Banner matching Arab Marble Promotions design */}
      <div
        className="relative py-12 md:py-24 bg-[#e9e8e6] border-b border-neutral-200 text-center bg-cover  overflow-hidden"
        style={{ backgroundImage: `url('https://arabmarble.ae/wp-content/uploads/2023/06/title-bg-2.png')` }}
      >
        <div className="absolute inset-0 bg-white/30" />
        <div className="relative z-10 max-w-[1140px] mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl md:text-[80px] font-bold tracking-[0.06em] uppercase" style={{ color: "#505050" }}>
            {locale === 'ar' ? 'العروض' : 'PROMOTIONS'}
          </h1>
        </div>
      </div>

      {/* Promotions Grid + Enquiry Modal */}
      <PromotionsSection locale={locale} />
    </div>
  );
}

