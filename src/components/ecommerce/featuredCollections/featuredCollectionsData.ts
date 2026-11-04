export const defaultFeaturedCollectionsData = {
  props: {
    badge: {
      en: "Curated Sets",
      hi: "विशेष सेट",
    },
    title: {
      en: "Featured Collections",
      hi: "विशेष संग्रह",
    },
    description: {
      en: "Discover our handpicked furniture collections designed to create cohesive, stunning spaces.",
      hi: "एकजुट, आश्चर्यजनक स्थान बनाने के लिए डिज़ाइन किए गए हमारे चुने हुए फर्नीचर संग्रह की खोज करें।",
    }
  },
  content: [
    {
      id: "coll_minimalist",
      type: "collection-card",
      props: {
        title: { en: "Nordic Minimalist", hi: "नॉर्डिक मिनिमलिस्ट" },
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800",
        link: "/collections/nordic"
      }
    },
    {
      id: "coll_luxury",
      type: "collection-card",
      props: {
        title: { en: "Luxury Velvet", hi: "लक्ज़री मखमली" },
        image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800",
        link: "/collections/luxury-velvet"
      }
    }
  ]
};
