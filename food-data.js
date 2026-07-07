/* ==========================================================================
   Daily Gym — Indian Food Database (South Indian, North Indian, Common)
   Calories and macros are approximate averages for a typical home-style
   serving. Actual values vary with recipe, oil/ghee used, and portion size —
   use these as a helpful estimate, not an exact lab measurement.
   ========================================================================== */

const CUISINES = ["south", "north", "common"];
const CUISINE_LABELS = { south: "South Indian", north: "North Indian", common: "Common / Sides" };
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };

/* Each food: id, name, cuisine, category, serving (label), cal, protein(g), carbs(g), fat(g) */
const FOODS = [
  // ---------------- SOUTH INDIAN ----------------
  { id: "idli", name: "Idli", cuisine: "south", category: "Breakfast", serving: "2 pieces (~80g)", cal: 78, protein: 2.5, carbs: 16, fat: 0.4 },
  { id: "plaindosa", name: "Plain Dosa", cuisine: "south", category: "Breakfast", serving: "1 medium", cal: 133, protein: 3.5, carbs: 18, fat: 5 },
  { id: "masaladosa", name: "Masala Dosa", cuisine: "south", category: "Breakfast", serving: "1 plate", cal: 250, protein: 5, carbs: 30, fat: 12 },
  { id: "ravadosa", name: "Rava Dosa", cuisine: "south", category: "Breakfast", serving: "1 medium", cal: 180, protein: 4, carbs: 22, fat: 8 },
  { id: "uttapam", name: "Uttapam", cuisine: "south", category: "Breakfast", serving: "1 medium", cal: 160, protein: 4, carbs: 24, fat: 5 },
  { id: "meduvada", name: "Medu Vada", cuisine: "south", category: "Breakfast", serving: "2 pieces", cal: 190, protein: 6, carbs: 18, fat: 10 },
  { id: "sambar", name: "Sambar", cuisine: "south", category: "Side", serving: "1 cup (~200ml)", cal: 120, protein: 5, carbs: 18, fat: 3 },
  { id: "rasam", name: "Rasam", cuisine: "south", category: "Side", serving: "1 cup (~200ml)", cal: 60, protein: 2, carbs: 10, fat: 1.5 },
  { id: "coconutchutney", name: "Coconut Chutney", cuisine: "south", category: "Side", serving: "2 tbsp", cal: 90, protein: 1.2, carbs: 4, fat: 8 },
  { id: "tomatochutney", name: "Tomato Chutney", cuisine: "south", category: "Side", serving: "2 tbsp", cal: 45, protein: 1, carbs: 5, fat: 2.5 },
  { id: "pongal", name: "Ven Pongal", cuisine: "south", category: "Breakfast", serving: "1 cup", cal: 250, protein: 6, carbs: 38, fat: 8 },
  { id: "upma", name: "Upma", cuisine: "south", category: "Breakfast", serving: "1 cup", cal: 220, protein: 5, carbs: 32, fat: 8 },
  { id: "idiyappam", name: "Idiyappam (String Hoppers)", cuisine: "south", category: "Breakfast", serving: "1 cup", cal: 115, protein: 2, carbs: 25, fat: 0.5 },
  { id: "appam", name: "Appam", cuisine: "south", category: "Breakfast", serving: "1 piece", cal: 120, protein: 2, carbs: 22, fat: 2.5 },
  { id: "puttu", name: "Puttu with Coconut", cuisine: "south", category: "Breakfast", serving: "1 cup", cal: 200, protein: 4, carbs: 38, fat: 4 },
  { id: "curdrice", name: "Curd Rice", cuisine: "south", category: "Rice", serving: "1 cup", cal: 180, protein: 5, carbs: 30, fat: 4 },
  { id: "lemonrice", name: "Lemon Rice", cuisine: "south", category: "Rice", serving: "1 cup", cal: 210, protein: 4, carbs: 32, fat: 7 },
  { id: "tamarindrice", name: "Tamarind Rice (Puliyodarai)", cuisine: "south", category: "Rice", serving: "1 cup", cal: 230, protein: 4, carbs: 34, fat: 8 },
  { id: "bisibelebath", name: "Bisi Bele Bath", cuisine: "south", category: "Rice", serving: "1 cup", cal: 290, protein: 7, carbs: 40, fat: 10 },
  { id: "sambarrice", name: "Sambar Rice", cuisine: "south", category: "Rice", serving: "1 cup", cal: 260, protein: 6, carbs: 42, fat: 6 },
  { id: "coconutrice", name: "Coconut Rice", cuisine: "south", category: "Rice", serving: "1 cup", cal: 240, protein: 3.5, carbs: 32, fat: 11 },
  { id: "curryleavesrice", name: "Curry Leaves Rice", cuisine: "south", category: "Rice", serving: "1 cup", cal: 220, protein: 3.5, carbs: 34, fat: 7 },
  { id: "chettinadchicken", name: "Chettinad Chicken Curry", cuisine: "south", category: "Main", serving: "1 cup", cal: 320, protein: 24, carbs: 8, fat: 20 },
  { id: "fishcurrykerala", name: "Kerala Fish Curry", cuisine: "south", category: "Main", serving: "1 cup", cal: 280, protein: 22, carbs: 6, fat: 18 },
  { id: "avial", name: "Avial", cuisine: "south", category: "Side", serving: "1 cup", cal: 190, protein: 4, carbs: 16, fat: 12 },
  { id: "kootu", name: "Kootu (Dal & Vegetable)", cuisine: "south", category: "Side", serving: "1 cup", cal: 170, protein: 7, carbs: 20, fat: 6 },
  { id: "poriyal", name: "Poriyal (Stir-Fried Veg)", cuisine: "south", category: "Side", serving: "1 cup", cal: 110, protein: 3, carbs: 12, fat: 6 },
  { id: "rasamvada", name: "Rasam Vada", cuisine: "south", category: "Snack", serving: "2 pieces", cal: 220, protein: 6, carbs: 22, fat: 11 },
  { id: "semiyapayasam", name: "Semiya Payasam", cuisine: "south", category: "Dessert", serving: "1 cup", cal: 260, protein: 5, carbs: 40, fat: 9 },
  { id: "mysorepak", name: "Mysore Pak", cuisine: "south", category: "Dessert", serving: "2 pieces", cal: 300, protein: 3, carbs: 32, fat: 18 },
  { id: "filtercoffee", name: "South Indian Filter Coffee", cuisine: "south", category: "Beverage", serving: "1 cup", cal: 70, protein: 2, carbs: 9, fat: 3 },
  { id: "buttermilk", name: "Buttermilk (Sambharam)", cuisine: "south", category: "Beverage", serving: "1 glass", cal: 50, protein: 2.5, carbs: 5, fat: 2 },
  { id: "hyderabadibiryani", name: "Hyderabadi Chicken Biryani", cuisine: "south", category: "Rice", serving: "1 plate (~300g)", cal: 450, protein: 22, carbs: 55, fat: 16 },
  { id: "vegbiryanisouth", name: "Vegetable Biryani (South style)", cuisine: "south", category: "Rice", serving: "1 plate", cal: 350, protein: 8, carbs: 50, fat: 13 },
  { id: "ravakesari", name: "Rava Kesari", cuisine: "south", category: "Dessert", serving: "1/2 cup", cal: 210, protein: 2, carbs: 30, fat: 9 },

  // ---------------- NORTH INDIAN ----------------
  { id: "roti", name: "Roti / Chapati (plain)", cuisine: "north", category: "Bread", serving: "1 piece", cal: 85, protein: 3, carbs: 18, fat: 0.5 },
  { id: "naan", name: "Naan (plain)", cuisine: "north", category: "Bread", serving: "1 piece", cal: 260, protein: 8, carbs: 45, fat: 5 },
  { id: "butternaan", name: "Butter Naan", cuisine: "north", category: "Bread", serving: "1 piece", cal: 310, protein: 8, carbs: 45, fat: 10 },
  { id: "paratha", name: "Plain Paratha", cuisine: "north", category: "Bread", serving: "1 piece", cal: 150, protein: 3.5, carbs: 20, fat: 7 },
  { id: "alooparatha", name: "Aloo Paratha", cuisine: "north", category: "Bread", serving: "1 piece", cal: 210, protein: 5, carbs: 28, fat: 9 },
  { id: "puri", name: "Puri", cuisine: "north", category: "Bread", serving: "1 piece", cal: 100, protein: 2, carbs: 12, fat: 5 },
  { id: "bhatura", name: "Bhatura", cuisine: "north", category: "Bread", serving: "1 piece", cal: 340, protein: 6, carbs: 40, fat: 17 },
  { id: "dalmakhani", name: "Dal Makhani", cuisine: "north", category: "Main", serving: "1 cup", cal: 330, protein: 12, carbs: 28, fat: 19 },
  { id: "daltadka", name: "Dal Tadka", cuisine: "north", category: "Main", serving: "1 cup", cal: 200, protein: 10, carbs: 26, fat: 7 },
  { id: "rajma", name: "Rajma (Kidney Bean Curry)", cuisine: "north", category: "Main", serving: "1 cup", cal: 280, protein: 13, carbs: 36, fat: 9 },
  { id: "chole", name: "Chole (Chickpea Curry)", cuisine: "north", category: "Main", serving: "1 cup", cal: 290, protein: 12, carbs: 34, fat: 11 },
  { id: "paneerbuttermasala", name: "Paneer Butter Masala", cuisine: "north", category: "Main", serving: "1 cup", cal: 380, protein: 14, carbs: 16, fat: 28 },
  { id: "palakpaneer", name: "Palak Paneer", cuisine: "north", category: "Main", serving: "1 cup", cal: 300, protein: 13, carbs: 12, fat: 22 },
  { id: "kadaipaneer", name: "Kadai Paneer", cuisine: "north", category: "Main", serving: "1 cup", cal: 320, protein: 14, carbs: 14, fat: 23 },
  { id: "shahipaneer", name: "Shahi Paneer", cuisine: "north", category: "Main", serving: "1 cup", cal: 350, protein: 13, carbs: 16, fat: 26 },
  { id: "butterchicken", name: "Butter Chicken", cuisine: "north", category: "Main", serving: "1 cup", cal: 420, protein: 26, carbs: 12, fat: 29 },
  { id: "chickencurrynorth", name: "Chicken Curry (North style)", cuisine: "north", category: "Main", serving: "1 cup", cal: 300, protein: 24, carbs: 8, fat: 19 },
  { id: "chickentikkamasala", name: "Chicken Tikka Masala", cuisine: "north", category: "Main", serving: "1 cup", cal: 370, protein: 25, carbs: 14, fat: 24 },
  { id: "roganjosh", name: "Rogan Josh", cuisine: "north", category: "Main", serving: "1 cup", cal: 350, protein: 23, carbs: 10, fat: 24 },
  { id: "aloogobi", name: "Aloo Gobi", cuisine: "north", category: "Main", serving: "1 cup", cal: 180, protein: 4, carbs: 24, fat: 8 },
  { id: "bainganbharta", name: "Baingan Bharta", cuisine: "north", category: "Main", serving: "1 cup", cal: 160, protein: 3, carbs: 16, fat: 9 },
  { id: "mixedvegcurry", name: "Mixed Vegetable Curry", cuisine: "north", category: "Main", serving: "1 cup", cal: 200, protein: 5, carbs: 20, fat: 11 },
  { id: "malaikofta", name: "Malai Kofta", cuisine: "north", category: "Main", serving: "2 pieces with gravy", cal: 400, protein: 9, carbs: 24, fat: 30 },
  { id: "cholebhature", name: "Chole Bhature", cuisine: "north", category: "Main", serving: "1 plate", cal: 630, protein: 16, carbs: 70, fat: 30 },
  { id: "samosa", name: "Samosa", cuisine: "north", category: "Snack", serving: "1 piece", cal: 260, protein: 4, carbs: 28, fat: 15 },
  { id: "pakora", name: "Vegetable Pakora", cuisine: "north", category: "Snack", serving: "1 cup", cal: 220, protein: 5, carbs: 22, fat: 13 },
  { id: "jeerarice", name: "Jeera Rice", cuisine: "north", category: "Rice", serving: "1 cup", cal: 210, protein: 4, carbs: 36, fat: 6 },
  { id: "peaspulao", name: "Peas Pulao", cuisine: "north", category: "Rice", serving: "1 cup", cal: 240, protein: 5, carbs: 38, fat: 7 },
  { id: "vegbiryaninorth", name: "Vegetable Biryani (Mughlai style)", cuisine: "north", category: "Rice", serving: "1 plate", cal: 380, protein: 8, carbs: 52, fat: 15 },
  { id: "chickenbiryaninorth", name: "Chicken Biryani (Awadhi style)", cuisine: "north", category: "Rice", serving: "1 plate (~300g)", cal: 460, protein: 24, carbs: 54, fat: 17 },
  { id: "kheer", name: "Kheer (Rice Pudding)", cuisine: "north", category: "Dessert", serving: "1 cup", cal: 230, protein: 6, carbs: 36, fat: 7 },
  { id: "gulabjamun", name: "Gulab Jamun", cuisine: "north", category: "Dessert", serving: "2 pieces", cal: 300, protein: 4, carbs: 42, fat: 13 },
  { id: "rasgulla", name: "Rasgulla", cuisine: "north", category: "Dessert", serving: "2 pieces", cal: 190, protein: 5, carbs: 36, fat: 3 },
  { id: "jalebi", name: "Jalebi", cuisine: "north", category: "Dessert", serving: "2 pieces", cal: 220, protein: 2, carbs: 38, fat: 7 },
  { id: "lassi", name: "Sweet Lassi", cuisine: "north", category: "Beverage", serving: "1 glass", cal: 220, protein: 6, carbs: 30, fat: 8 },
  { id: "masalachai", name: "Masala Chai", cuisine: "north", category: "Beverage", serving: "1 cup", cal: 60, protein: 1.5, carbs: 9, fat: 2 },
  { id: "raita", name: "Raita (Cucumber/Plain)", cuisine: "north", category: "Side", serving: "1 cup", cal: 90, protein: 4, carbs: 8, fat: 4.5 },
  { id: "paneertikka", name: "Paneer Tikka", cuisine: "north", category: "Snack", serving: "4 pieces", cal: 250, protein: 15, carbs: 8, fat: 18 },
  { id: "tandoorichicken", name: "Tandoori Chicken", cuisine: "north", category: "Main", serving: "2 pieces (leg)", cal: 250, protein: 30, carbs: 4, fat: 12 },
  { id: "eggcurry", name: "Egg Curry", cuisine: "north", category: "Main", serving: "1 cup (2 eggs)", cal: 280, protein: 16, carbs: 8, fat: 20 },

  // ---------------- COMMON / SIDES (either cuisine) ----------------
  { id: "steamedrice", name: "Steamed Rice", cuisine: "common", category: "Rice", serving: "1 cup", cal: 200, protein: 4, carbs: 44, fat: 0.5 },
  { id: "curd", name: "Curd / Yogurt (plain)", cuisine: "common", category: "Side", serving: "1 cup", cal: 150, protein: 8, carbs: 11, fat: 8 },
  { id: "papad", name: "Papad (roasted)", cuisine: "common", category: "Side", serving: "1 piece", cal: 35, protein: 2, carbs: 6, fat: 0.5 },
  { id: "pickle", name: "Pickle (Achaar)", cuisine: "common", category: "Side", serving: "1 tbsp", cal: 45, protein: 0.3, carbs: 3, fat: 4 },
  { id: "ghee", name: "Ghee", cuisine: "common", category: "Side", serving: "1 tsp", cal: 45, protein: 0, carbs: 0, fat: 5 },
  { id: "boiledegg", name: "Boiled Egg", cuisine: "common", category: "Side", serving: "1 egg", cal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: "banana", name: "Banana", cuisine: "common", category: "Snack", serving: "1 medium", cal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "greensalad", name: "Green Salad (cucumber/tomato/onion)", cuisine: "common", category: "Side", serving: "1 cup", cal: 40, protein: 1.5, carbs: 8, fat: 0.3 },
  { id: "roastedpeanuts", name: "Roasted Peanuts", cuisine: "common", category: "Snack", serving: "small handful (30g)", cal: 170, protein: 7, carbs: 6, fat: 14 },
  { id: "milk", name: "Milk (whole)", cuisine: "common", category: "Beverage", serving: "1 glass (250ml)", cal: 150, protein: 8, carbs: 12, fat: 8 }
];

function foodById(id) { return FOODS.find(f => f.id === id); }
