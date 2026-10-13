import type { Cook, Recipe } from "../types";

// Placeholder data until the backend feed endpoints are wired up.

const unsplash = (id: string) =>
      `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const cooks: Cook[] = [
      { id: "me", name: "Me", isMe: true },
      { id: "nicolas", name: "Nicolás", hasNewStory: true },
      { id: "valentina", name: "Valentina" },
      { id: "alessandro", name: "Alessandro" },
      { id: "lorenzo", name: "Lorenzo" },
      { id: "carla", name: "Carla" },
      { id: "carlos", name: "Carlos" },
];

export const todaysPicks: Recipe[] = [
      {
            id: "rose-chicken-pasta",
            title: "Rose Chicken Pasta",
            cuisine: "Italian",
            tags: ["Pasta", "Chicken", "Rose Sauce", "High Protein"],
            duration: "20-25 min",
            imageUrl: unsplash("photo-1621996346565-e3dbc646d9a9"),
      },
      {
            id: "garlic-shrimp-spaghetti",
            title: "Garlic Shrimp Spaghetti",
            cuisine: "Mediterranean",
            tags: ["Pasta", "Seafood", "Cherry Tomato"],
            duration: "25-30 min",
            imageUrl: unsplash("photo-1563379926898-05f4575a45d8"),
      },
];

export const fromFavorites: Recipe[] = [
      {
            id: "classic-carbonara",
            title: "Classic Carbonara",
            cuisine: "Italian",
            tags: ["Pasta", "Pancetta", "Pecorino"],
            duration: "15-20 min",
            imageUrl: unsplash("photo-1612874742237-6526221588e3"),
      },
      {
            id: "creamy-beef-tagliatelle",
            title: "Creamy Beef Tagliatelle",
            cuisine: "Italian",
            tags: ["Pasta", "Beef", "Sun-dried Tomato"],
            duration: "30-35 min",
            imageUrl: unsplash("photo-1551183053-bf91a1d81141"),
      },
];
