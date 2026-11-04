"use client";

import Script from "next/script";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function AnalyticsInjector() {
  const websiteDetail = useSelector(
    (state: RootState) => state.websiteDetail.websiteDetail
  );


  const analytics = websiteDetail?.payload?.analytics_tracking;

  const gaMeasurementId = analytics?.googleAnalytics?.measurementId;
  const gaEnabled = analytics?.googleAnalytics?.enabled;
  const metaPixelId = analytics?.metaPixel?.pixelId;
  const metaEnabled = analytics?.metaPixel?.enabled;

  return (
    <>
      {gaEnabled && gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}
      {metaEnabled && metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
