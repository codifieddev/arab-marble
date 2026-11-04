export const defaultShopByRoomData = {
  props: {
    badge: { en: "Shop by Room" },
    heading: { en: "Find Your Perfect Space" },
    buttonLabel: { en: "Browse Rooms" },
    buttonLink: "/shop",
    exploreLabel: { en: "Explore Collection" }
  },
  content: [
    {
      id: "living-room",
      props: {
        name: { en: "Living Room" },
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80"
      }
    },
    {
      id: "bedroom",
      props: {
        name: { en: "Bedroom" },
        image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80"
      }
    },
    {
      id: "dining",
      props: {
        name: { en: "Dining" },
        image: "https://images.unsplash.com/photo-1577157581154-a31421063ca4?auto=format&fit=crop&q=80"
      }
    },
    {
      id: "storage",
      props: {
        name: { en: "Storage" },
        image: "https://images.unsplash.com/photo-1595428774223-ea526281bb0a?auto=format&fit=crop&q=80"
      }
    }
  ]
};
