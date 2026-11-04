export const defaultCategoryGridData = {
  props: {
    badge: {
      en: "Categories",
      hi: "श्रेणियाँ",
    },
    title: {
      en: "Shop by Room & Style",
      hi: "कमरे और शैली के अनुसार खरीदारी करें",
    },
    description: {
      en: "Explore our thoughtfully curated collections designed to elevate every corner of your home.",
      hi: "अपने घर के हर कोने को ऊंचा करने के लिए डिज़ाइन किए गए हमारे विचारपूर्वक तैयार किए गए संग्रह का अन्वेषण करें।",
    }
  },
  content: [
    {
      id: "cat_sofas",
      type: "category-item",
      props: {
        title: { en: "Sofas", hi: "सोफा" },
        count: { type: "number", value: 124 },
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=600",
        link: "/category/sofas"
      }
    },
    {
      id: "cat_beds",
      type: "category-item",
      props: {
        title: { en: "Beds", hi: "बिस्तर" },
        count: { type: "number", value: 86 },
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",
        link: "/category/beds"
      }
    },
    {
      id: "cat_dining",
      type: "category-item",
      props: {
        title: { en: "Dining", hi: "भोजन कक्ष" },
        count: { type: "number", value: 92 },
        image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=600",
        link: "/category/dining"
      }
    },
    {
      id: "cat_storage",
      type: "category-item",
      props: {
        title: { en: "Storage", hi: "भंडारण" },
        count: { type: "number", value: 64 },
        image: "https://images.unsplash.com/photo-1595514535315-2a29094cefb0?auto=format&fit=crop&q=80&w=600",
        link: "/category/storage"
      }
    },
    {
      id: "cat_study",
      type: "category-item",
      props: {
        title: { en: "Study & Office", hi: "अध्ययन और कार्यालय" },
        count: { type: "number", value: 48 },
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600",
        link: "/category/study"
      }
    },
    {
      id: "cat_outdoor",
      type: "category-item",
      props: {
        title: { en: "Outdoor", hi: "आउटडोर" },
        count: { type: "number", value: 36 },
        image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&q=80&w=600",
        link: "/category/outdoor"
      }
    },
    {
      id: "cat_decor",
      type: "category-item",
      props: {
        title: { en: "Decor", hi: "सजावट" },
        count: { type: "number", value: 215 },
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
        link: "/category/decor"
      }
    }
  ]
};
