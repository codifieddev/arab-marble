export const defaultCraftData = {
  props: {
    badge: { en: "Craft & Quality" },
    title: { en: "Built for Everyday Living" },
    buttonLabel: { en: "Our Story" },
    buttonLink: "/about",
    mainHeading: { en: "Premium wood, soft textiles, timeless forms." },
    description: { en: "Every piece is engineered for longevity and comfort, using only the finest materials sourced responsibly." }
  },
  content: [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=1600",
      alt: "Materials"
    },
    {
      type: "list",
      items: [
        { en: "Solid oak" },
        { en: "Stain-resistant" },
        { en: "Tested" }
      ]
    },
    {
      type: "buttons",
      items: [
        { label: { en: "Material Guide" }, link: "/about" },
        { label: { en: "Book Appointment" }, link: "/contact" }
      ]
    }
  ]
};
