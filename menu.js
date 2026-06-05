// Drink menu — 24 items. Prices in THB.
// Each drink lists which customizations apply. `temps` = available temps (hot/iced).
// Edit freely; the UI reads from this file.

window.MENU_CATEGORIES = [
  { id: "espresso", label: "Espresso" },
  { id: "milk",     label: "Milk Coffee" },
  { id: "brewed",   label: "Brewed" },
  { id: "iced",     label: "Iced & Cold" },
  { id: "tea",      label: "Tea" },
  { id: "other",    label: "Non-Coffee" }
];

window.MENU = [
  // Espresso
  { id: "esp-01", cat: "espresso", name: "Espresso",          desc: "Single shot. Bright, citrus finish.",        price: 55, temps: ["hot"],        opts: ["sugar"] },
  { id: "esp-02", cat: "espresso", name: "Doppio",            desc: "Double shot. For the serious.",              price: 65, temps: ["hot"],        opts: ["sugar"] },
  { id: "esp-03", cat: "espresso", name: "Americano",         desc: "Espresso lengthened with hot water.",        price: 60, temps: ["hot","iced"], opts: ["sugar","ice","size"] },
  { id: "esp-04", cat: "espresso", name: "Macchiato",         desc: "Espresso marked with milk foam.",            price: 65, temps: ["hot"],        opts: ["sugar"] },

  // Milk coffee
  { id: "mlk-01", cat: "milk", name: "Latte",                 desc: "Steamed milk, light foam, soft body.",       price: 75, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },
  { id: "mlk-02", cat: "milk", name: "Cappuccino",            desc: "Equal espresso, milk, dense foam.",          price: 75, temps: ["hot"],        opts: ["sugar","size","milk"] },
  { id: "mlk-03", cat: "milk", name: "Flat White",            desc: "Velvety microfoam, double ristretto.",       price: 80, temps: ["hot"],        opts: ["sugar","milk"] },
  { id: "mlk-04", cat: "milk", name: "Mocha",                 desc: "Espresso, chocolate, milk. Dessert energy.", price: 85, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },
  { id: "mlk-05", cat: "milk", name: "Caramel Latte",         desc: "Latte with a slow ribbon of caramel.",       price: 90, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },

  // Brewed
  { id: "brw-01", cat: "brewed", name: "House Drip",          desc: "Today's house batch. Ask the barista.",      price: 60, temps: ["hot"],        opts: ["size"] },
  { id: "brw-02", cat: "brewed", name: "V60 Pour-Over",       desc: "Single-origin, brewed to order.",            price: 95, temps: ["hot"],        opts: [] },
  { id: "brw-03", cat: "brewed", name: "Cold Brew",           desc: "16-hour steep. Smooth, low acid.",           price: 85, temps: ["iced"],       opts: ["ice","size"] },

  // Iced
  { id: "ice-01", cat: "iced", name: "Iced Latte",            desc: "Espresso + cold milk over ice.",             price: 80, temps: ["iced"],       opts: ["sugar","ice","size","milk"] },
  { id: "ice-02", cat: "iced", name: "Iced Mocha",            desc: "Espresso, chocolate, milk, ice.",            price: 90, temps: ["iced"],       opts: ["sugar","ice","size","milk"] },
  { id: "ice-03", cat: "iced", name: "Shaken Espresso",       desc: "Shaken with ice — bright, foamy top.",       price: 85, temps: ["iced"],       opts: ["sugar","ice","milk"] },
  { id: "ice-04", cat: "iced", name: "Affogato",              desc: "Vanilla gelato drowned in hot espresso.",    price: 95, temps: ["iced"],       opts: [] },

  // Tea
  { id: "tea-01", cat: "tea", name: "Matcha Latte",           desc: "Stone-ground matcha, steamed milk.",         price: 90, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },
  { id: "tea-02", cat: "tea", name: "Earl Grey",              desc: "Bergamot black tea, brewed long.",           price: 60, temps: ["hot","iced"], opts: ["sugar","ice","size"] },
  { id: "tea-03", cat: "tea", name: "Jasmine Green",          desc: "Light, floral, gentle finish.",              price: 60, temps: ["hot","iced"], opts: ["sugar","ice","size"] },
  { id: "tea-04", cat: "tea", name: "Chai Latte",             desc: "Spiced black tea with steamed milk.",        price: 85, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },

  // Non-coffee
  { id: "oth-01", cat: "other", name: "Hot Chocolate",        desc: "Dark chocolate ganache, whole milk.",        price: 80, temps: ["hot","iced"], opts: ["sugar","ice","size","milk"] },
  { id: "oth-02", cat: "other", name: "Yuzu Honey",           desc: "Yuzu marmalade, honey, hot water.",          price: 70, temps: ["hot","iced"], opts: ["sugar","ice","size"] },
  { id: "oth-03", cat: "other", name: "Sparkling Lemonade",   desc: "Fresh lemon, soda, mint.",                   price: 70, temps: ["iced"],       opts: ["sugar","ice"] },
  { id: "oth-04", cat: "other", name: "Coconut Water",        desc: "Chilled, single-serve, unsweetened.",        price: 55, temps: ["iced"],       opts: ["ice"] }
];

// Option vocabularies — used by the customize sheet.
window.MENU_OPTIONS = {
  size:  [{ id: "S", label: "Small",  delta:  0 }, { id: "M", label: "Medium", delta: 10 }, { id: "L", label: "Large", delta: 20 }],
  sugar: [{ id: "0",   label: "No sugar" }, { id: "25",  label: "25%" }, { id: "50", label: "50%" }, { id: "75", label: "75%" }, { id: "100", label: "100%" }],
  ice:   [{ id: "0",   label: "No ice" }, { id: "less", label: "Less" }, { id: "normal", label: "Normal" }, { id: "more", label: "More" }],
  milk:  [{ id: "whole",   label: "Whole",   delta: 0 }, { id: "oat", label: "Oat", delta: 15 }, { id: "almond", label: "Almond", delta: 15 }, { id: "soy", label: "Soy", delta: 10 }]
};
