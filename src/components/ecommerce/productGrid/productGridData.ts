export const defaultProductGridData = {
  props: {
    badge: {
      en: "Top Picks",
      hi: "शीर्ष चयन",
    },
    title: {
      en: "Trending Now",
      hi: "अभी ट्रेंडिंग",
    },
    filterOptions: {
      categories: [
        { en: "All", hi: "सभी" },
        { en: "Sofas", hi: "सोफा" },
        { en: "Beds", hi: "बिस्तर" },
        { en: "Dining", hi: "भोजन कक्ष" },
        { en: "Storage", hi: "भंडारण" }
      ],
      sorting: [
        { value: "featured", label: { en: "Featured", hi: "विशेष" } },
        { value: "price_asc", label: { en: "Price: Low to High", hi: "मूल्य: कम से अधिक" } },
        { value: "price_desc", label: { en: "Price: High to Low", hi: "मूल्य: अधिक से कम" } },
        { value: "rating_desc", label: { en: "Top Rated", hi: "शीर्ष रेटेड" } }
      ]
    }
  },
  content: [
    {
      id: "prod_1",
      type: "product-card",
      props: {
        title: { en: "Oakwood Dining Table", hi: "ओकवुड डाइनिंग टेबल" },
        category: { en: "Dining", hi: "भोजन कक्ष" },
        price: { type: "number", value: 1299 },
        oldPrice: { type: "number", value: 1499 },
        rating: { type: "number", value: 4.8 },
        tags: { type: "list", value: [{ en: "Best Seller", hi: "बेस्ट सेलर" }] },
        image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/oakwood-table"
      }
    },
    {
      id: "prod_2",
      type: "product-card",
      props: {
        title: { en: "Velvet Lounge Sofa", hi: "मखमली लाउंज सोफा" },
        category: { en: "Sofas", hi: "सोफा" },
        price: { type: "number", value: 2499 },
        rating: { type: "number", value: 4.9 },
        tags: { type: "list", value: [{ en: "New", hi: "नया" }] },
        image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/velvet-lounge-sofa"
      }
    },
    {
      id: "prod_3",
      type: "product-card",
      props: {
        title: { en: "Minimalist Platform Bed", hi: "न्यूनतम प्लेटफॉर्म बिस्तर" },
        category: { en: "Beds", hi: "बिस्तर" },
        price: { type: "number", value: 1850 },
        rating: { type: "number", value: 4.6 },
        tags: { type: "list", value: [] },
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/minimalist-bed"
      }
    },
    {
      id: "prod_4",
      type: "product-card",
      props: {
        title: { en: "Walnut Bookshelf", hi: "अखरोट बुकशेल्फ़" },
        category: { en: "Storage", hi: "भंडारण" },
        price: { type: "number", value: 850 },
        oldPrice: { type: "number", value: 950 },
        rating: { type: "number", value: 4.7 },
        tags: { type: "list", value: [{ en: "Sale", hi: "बिक्री" }] },
        image: "https://images.unsplash.com/photo-1595514535315-2a29094cefb0?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/walnut-bookshelf"
      }
    },
    {
      id: "prod_5",
      type: "product-card",
      props: {
        title: { en: "Leather Accent Chair", hi: "लेदर एक्सेंट चेयर" },
        category: { en: "Sofas", hi: "सोफा" },
        price: { type: "number", value: 650 },
        rating: { type: "number", value: 4.8 },
        tags: { type: "list", value: [] },
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/leather-chair"
      }
    },
    {
      id: "prod_6",
      type: "product-card",
      props: {
        title: { en: "Marble Dining Set", hi: "मार्बल डाइनिंग सेट" },
        category: { en: "Dining", hi: "भोजन कक्ष" },
        price: { type: "number", value: 3200 },
        rating: { type: "number", value: 5.0 },
        tags: { type: "list", value: [{ en: "Premium", hi: "प्रीमियम" }] },
        image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=600",
        ctaButton: { en: "Add to Cart", hi: "कार्ट में डालें" },
        link: "/product/marble-dining"
      }
    }
  ]
};
