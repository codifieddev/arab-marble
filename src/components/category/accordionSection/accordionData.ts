export const defaultSidebarFilters = [
  {
    id: "filter-category",
    type: "section",
    adminTitle: "Filter Category",
    layout: "sidebar",
    columns: null,
    props: {
      title: { en: "Category", hi: "श्रेणी" },
      filterType: "category-list"
    },
    content: null
  },
  {
    id: "filter-material",
    type: "section",
    adminTitle: "Filter Material",
    layout: "sidebar",
    columns: null,
    props: {
      title: { en: "Material", hi: "सामग्री" },
      filterType: "checkbox-list"
    },
    content: [
      {
        id: "material-1",
        type: "item",
        props: {
          title: { en: "Solid Oak", hi: "ठोस ओक" },
          value: "Solid Oak",
          count: 12
        }
      },
      {
        id: "material-2",
        type: "item",
        props: {
          title: { en: "Velvet", hi: "मखमली" },
          value: "Velvet",
          count: 8
        }
      },
      {
        id: "material-3",
        type: "item",
        props: {
          title: { en: "Linen", hi: "लिनन" },
          value: "Linen",
          count: 15
        }
      },
      {
        id: "material-4",
        type: "item",
        props: {
          title: { en: "Ceramic", hi: "सिरेमिक" },
          value: "Ceramic",
          count: 5
        }
      }
    ]
  },
  {
    id: "filter-rating",
    type: "section",
    adminTitle: "Filter Rating",
    layout: "sidebar",
    columns: null,
    props: {
      title: { en: "Rating", hi: "रेटिंग" },
      filterType: "rating-list",
      isLast: true
    },
    content: [
      {
        id: "rating-1",
        type: "item",
        props: {
          value: 4.8,
          count: 26
        }
      },
      {
        id: "rating-2",
        type: "item",
        props: {
          value: 4.5,
          count: 18
        }
      },
      {
        id: "rating-3",
        type: "item",
        props: {
          value: 4.0,
          count: 12
        }
      }
    ]
  }
];
