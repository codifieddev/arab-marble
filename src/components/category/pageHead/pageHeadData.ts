export const defaultSubCategories = [
  {
    id: "cat-1",
    type: "item",
    props: {
      label: { en: "Dog Diapers", hi: "डॉग डायपर" }
    }
  },
  {
    id: "cat-2",
    type: "item",
    props: {
      label: { en: "Suspenders & Harnesses", hi: "सस्पेंडर्स और हार्नेस" }
    }
  },
  {
    id: "cat-3",
    type: "item",
    props: {
      label: { en: "Male Belly Bands", hi: "मेल बेली बैंड्स" }
    }
  },
  {
    id: "cat-4",
    type: "item",
    props: {
      label: { en: "Washable Liners", hi: "वॉशेबल लाइनर्स" }
    }
  },
  {
    id: "cat-5",
    type: "item",
    props: {
      label: { en: "Accessories", hi: "एक्सेसरीज" }
    }
  }
];

export const defaultPills = (productCount: number) => [
  {
    label: { en: "Products", hi: "उत्पाद" },
    value: `${productCount || 0}`,
    isBold: true
  },
  {
    label: { en: "Protection", hi: "सुरक्षा" },
    value: "100% Escape-Proof",
    isBold: true
  },
  {
    label: { en: "Satisfaction", hi: "संतुष्टि" },
    value: "Guaranteed",
    isBold: true
  }
];

export const defaultPageHeadSection = {
  id: "shop-page-head",
  type: "section",
  adminTitle: "Category Page Head",
  layout: "fullwidth",
  columns: null,
  props: {
    badge: {
      en: "PeeKeeper Collection",
      hi: "पीकीपर संग्रह"
    },
    heading: {
      en: "Escape-Proof Hygiene Solutions",
      hi: "एस्केप-प्रूफ हाइजीन उत्पाद"
    },
    description: {
      en: "Explore our curated collection of escape-proof dog diapers, suspenders, and premium pet hygiene essentials. Engineered for active dogs, trusted by pet parents.",
      hi: "हमारे एस्केप-प्रूफ डॉग डायपर, सस्पेंडर्स और प्रीमियम पेट हाइजीन उत्पादों का अन्वेषण करें।"
    }
  },
  content: defaultSubCategories
};
