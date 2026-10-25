export const INVENTORY_CATEGORIES = [
  "All",
  "Disnaker",
  "Barham",
  "Preparean",
];

export const CRAFTING_RECIPES = [
  {
    id: 1,

    name: "Katana",

    category: "Preparean",

    materials: [
      {
        item: "Iron",
        qty: 5,
      },

      {
        item: "Wood",
        qty: 2,
      },
    ],

    result: {
      item: "Katana",
      qty: 1,
    },
  },

  {
    id: 2,

    name: "Armor",

    category: "Preparean",

    materials: [
      {
        item: "Iron",
        qty: 10,
      },

      {
        item: "Leather",
        qty: 5,
      },
    ],

    result: {
      item: "Armor",
      qty: 1,
    },
  },
];