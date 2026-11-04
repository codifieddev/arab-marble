export const defaultServices = [
  {
    id: "service-1",
    type: "service-card",
    props: {
      title: { en: "Interior Design" },
      description: { en: "Expert consultation for your perfect living space." },
      icon: "pen-tool"
    }
  },
  {
    id: "service-2",
    type: "service-card",
    props: {
      title: { en: "Custom Furniture" },
      description: { en: "Handcrafted pieces tailored to your exact needs." },
      icon: "hammer"
    }
  },
  {
    id: "service-3",
    type: "service-card",
    props: {
      title: { en: "Home Styling" },
      description: { en: "Premium curation and arrangement for every room." },
      icon: "package"
    }
  }
];

export const defaultServiceProps = {
  badge: { en: "What we offer" },
  heading: { en: "Our Bespoke Services" },
  viewAllLabel: { en: "View All Services" },
  viewAllLink: "/services"
};
