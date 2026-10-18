import { MenuItem, ToppingOption, PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese, PromoCode } from '../types/pizza';

export const SIZE_MULTIPLIERS: Record<PizzaSize, { price: number; calMultiplier: number; sliceCount: number }> = {
  'Small (10")': { price: 0, calMultiplier: 0.75, sliceCount: 6 },
  'Medium (12")': { price: 3.5, calMultiplier: 1.0, sliceCount: 8 },
  'Large (14")': { price: 6.5, calMultiplier: 1.35, sliceCount: 8 },
  'Family XL (16")': { price: 9.5, calMultiplier: 1.7, sliceCount: 12 },
};

export const CRUST_PRICING: Record<PizzaCrust, number> = {
  'Hand-Tossed Classic': 0,
  'Neapolitan Sourdough': 1.0,
  'New York Thin & Crispy': 0,
  'Garlic Herb Stuffed Crust': 3.5,
  'Cauliflower Gluten-Free': 3.0,
};

export const AVAILABLE_TOPPINGS: ToppingOption[] = [
  // Meats
  { id: 'pepperoni', name: 'Cupped Pepperoni', category: 'meat', price: 2.0, calories: 120, color: '#b91c1c', iconName: 'Beef' },
  { id: 'italian_sausage', name: 'Spicy Italian Sausage', category: 'meat', price: 2.25, calories: 140, color: '#9a3412', iconName: 'Flame' },
  { id: 'prosciutto', name: 'Prosciutto di Parma', category: 'meat', price: 3.0, calories: 100, color: '#e11d48', iconName: 'Ribbon' },
  { id: 'bacon', name: 'Smoked Applewood Bacon', category: 'meat', price: 2.5, calories: 150, color: '#7f1d1d', iconName: 'Flame' },
  { id: 'grilled_chicken', name: 'Rosemary Grilled Chicken', category: 'meat', price: 2.25, calories: 110, color: '#d97706', iconName: 'Drumstick' },
  { id: 'bbq_brisket', name: 'Slow Smoked Brisket', category: 'meat', price: 3.25, calories: 160, color: '#451a03', iconName: 'Flame' },

  // Veggies
  { id: 'mushrooms', name: 'Wild Cremini Mushrooms', category: 'veggie', price: 1.5, calories: 25, color: '#78716c', iconName: 'Circle' },
  { id: 'fresh_basil', name: 'Fresh Genovese Basil', category: 'veggie', price: 1.0, calories: 5, color: '#15803d', iconName: 'Leaf' },
  { id: 'bell_peppers', name: 'Roasted Bell Peppers', category: 'veggie', price: 1.5, calories: 20, color: '#dc2626', iconName: 'Sun' },
  { id: 'kalamata_olives', name: 'Kalamata Black Olives', category: 'veggie', price: 1.75, calories: 45, color: '#1c1917', iconName: 'Disc' },
  { id: 'jalapenos', name: 'Fire Pickled Jalapeños', category: 'veggie', price: 1.25, calories: 15, color: '#16a34a', iconName: 'Flame' },
  { id: 'red_onions', name: 'Caramelized Red Onions', category: 'veggie', price: 1.25, calories: 30, color: '#831843', iconName: 'Layers' },
  { id: 'artichokes', name: 'Marinated Artichoke Hearts', category: 'veggie', price: 2.0, calories: 35, color: '#65a30d', iconName: 'Flower' },
  { id: 'arugula', name: 'Baby Wild Arugula', category: 'veggie', price: 1.25, calories: 10, color: '#166534', iconName: 'Leaf' },

  // Cheeses & Finishes
  { id: 'fior_di_latte', name: 'Fior di Latte Mozzarella', category: 'cheese', price: 2.5, calories: 95, color: '#fef08a', iconName: 'Shield' },
  { id: 'gorgonzola', name: 'Aged Gorgonzola Dolce', category: 'cheese', price: 2.5, calories: 110, color: '#ca8a04', iconName: 'Sparkles' },
  { id: 'hot_honey', name: 'Mike\'s Hot Honey Drizzle', category: 'finish', price: 1.75, calories: 60, color: '#f59e0b', iconName: 'Droplet' },
  { id: 'truffle_oil', name: 'White Truffle Oil Drizzle', category: 'finish', price: 2.5, calories: 80, color: '#eab308', iconName: 'Sparkles' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'pizza-diablo-pepperoni',
    name: 'The Godfather Diablo & Hot Honey',
    category: 'specialty',
    description: 'Crispy cupped pepperoni, calabrian chili oil, crushed San Marzano tomato, fresh mozzarella, finished with wildflower hot honey drizzle.',
    basePrice: 19.50,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    dietary: ['spicy'],
    isPopular: true,
    isSpicy: true,
    calories: 1420,
    defaultSize: 'Large (14")',
    defaultCrust: 'Neapolitan Sourdough',
    defaultSauce: 'San Marzano Tomato',
    defaultToppings: ['pepperoni', 'jalapenos', 'hot_honey']
  },
  {
    id: 'pizza-margherita-dop',
    name: 'Nonna\'s Margherita Vera D.O.P.',
    category: 'specialty',
    description: 'Authentic 72-hour sourdough crust, San Marzano D.O.P. tomatoes, fresh torn Fior di Latte mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
    basePrice: 17.00,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    isPopular: true,
    calories: 1180,
    defaultSize: 'Large (14")',
    defaultCrust: 'Neapolitan Sourdough',
    defaultSauce: 'San Marzano Tomato',
    defaultToppings: ['fresh_basil', 'fior_di_latte']
  },
  {
    id: 'pizza-tartufo-mushroom',
    name: 'Tartufo Wild Forest Mushroom',
    category: 'specialty',
    description: 'Black truffle garlic cream, roasted wild cremini & shiitake mushrooms, melted fontina cheese, fresh thyme, and white truffle oil drizzle.',
    basePrice: 21.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    isPopular: true,
    calories: 1350,
    defaultSize: 'Large (14")',
    defaultCrust: 'Hand-Tossed Classic',
    defaultSauce: 'Creamy Garlic Alfredo',
    defaultToppings: ['mushrooms', 'truffle_oil']
  },
  {
    id: 'pizza-bbq-brisket',
    name: 'Smokehouse BBQ Brisket & Bacon',
    category: 'specialty',
    description: '14-hour smoked beef brisket, sweet Kentucky bourbon BBQ sauce, applewood bacon crumbles, pickled red onions, smoked gouda, and fresh chopped cilantro.',
    basePrice: 22.50,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    dietary: ['halal'],
    calories: 1650,
    defaultSize: 'Large (14")',
    defaultCrust: 'New York Thin & Crispy',
    defaultSauce: 'Sweet Smoky BBQ',
    defaultToppings: ['bbq_brisket', 'bacon', 'red_onions']
  },
  {
    id: 'pizza-tuscan-vegan',
    name: 'Tuscan Garden Harvest (Plant-Based)',
    category: 'specialty',
    description: 'Creamy vegan cashew mozzarella, fire-roasted red bell peppers, marinated artichoke hearts, kalamata black olives, baby wild arugula, and Genovese basil pesto.',
    basePrice: 19.00,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegan', 'vegetarian'],
    calories: 1040,
    defaultSize: 'Large (14")',
    defaultCrust: 'Neapolitan Sourdough',
    defaultSauce: 'Genovese Basil Pesto',
    defaultToppings: ['artichokes', 'bell_peppers', 'kalamata_olives', 'arugula']
  },
  {
    id: 'pizza-prosciutto-fig',
    name: 'Prosciutto di Parma & Black Fig',
    category: 'specialty',
    description: 'Thinly sliced 24-month aged Prosciutto di Parma, black mission fig preserves, creamy goat cheese, baby wild arugula, and aged Modena balsamic reduction glaze.',
    basePrice: 22.00,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
    dietary: [],
    calories: 1390,
    defaultSize: 'Large (14")',
    defaultCrust: 'Neapolitan Sourdough',
    defaultSauce: 'San Marzano Tomato',
    defaultToppings: ['prosciutto', 'arugula']
  },
  {
    id: 'pizza-quattro-formaggi',
    name: 'Quattro Formaggi D’Oro',
    category: 'specialty',
    description: 'A luxurious four-cheese celebration of Fior di Latte, aged Gorgonzola Dolce, Fontina, and shaved 24-month Parmigiano-Reggiano with cracked black pepper.',
    basePrice: 18.50,
    image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    calories: 1480,
    defaultSize: 'Large (14")',
    defaultCrust: 'Hand-Tossed Classic',
    defaultSauce: 'San Marzano Tomato',
    defaultToppings: ['fior_di_latte', 'gorgonzola']
  },
  {
    id: 'pizza-custom-studio',
    name: 'Craft Your Own Woodfire Masterpiece',
    category: 'custom',
    description: 'Start with our slow-fermented hand-stretched dough. Choose your crust, artisan sauce, gourmet cheeses, and fire-roasted toppings.',
    basePrice: 15.00,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian', 'vegan', 'gluten-free', 'halal'],
    calories: 980,
    defaultSize: 'Large (14")',
    defaultCrust: 'Neapolitan Sourdough',
    defaultSauce: 'San Marzano Tomato',
    defaultToppings: []
  },

  // Starters & Sides
  {
    id: 'side-garlic-knots',
    name: 'Truffle & Herb Garlic Knots (6 pcs)',
    category: 'sides',
    description: 'Warm hand-tied pizza dough knots tossed in garlic confit butter, fresh parsley, pecorino cheese, and served with Nonna\'s warm San Marzano marinara dip.',
    basePrice: 7.50,
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    isPopular: true,
    calories: 520
  },
  {
    id: 'side-calabrian-wings',
    name: 'Woodfire Roasted Calabrian Wings (8 pcs)',
    category: 'sides',
    description: 'Jumbo wings slow-roasted in the 800° woodfire oven, glazed with spicy calabrian chili hot honey and fresh rosemary sprigs.',
    basePrice: 13.50,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    dietary: ['spicy', 'halal'],
    isSpicy: true,
    calories: 780
  },
  {
    id: 'side-cheesy-bread',
    name: 'Pull-Apart Cheesy Mozzarella Bread',
    category: 'sides',
    description: 'Loaded with melted whole milk mozzarella, roasted garlic butter, and fresh oregano on crispy ciabatta crust with spicy arrabiata sauce.',
    basePrice: 8.50,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    calories: 640
  },
  {
    id: 'side-burrata-caprese',
    name: 'Artisan Burrata Caprese Salad',
    category: 'sides',
    description: 'Whole imported pugliese burrata, heirloom cherry tomatoes, fresh basil, toasted pine nuts, and 12-year aged balsamic glaze.',
    basePrice: 12.00,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian', 'gluten-free'],
    calories: 420
  },

  // Drinks
  {
    id: 'drink-san-pellegrino-lemon',
    name: 'San Pellegrino Sparkling Limonata (330ml)',
    category: 'drinks',
    description: 'Crisp, zesty Italian sparkling citrus soda made with sun-ripened Sicilian lemons.',
    basePrice: 3.50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegan', 'gluten-free'],
    calories: 130
  },
  {
    id: 'drink-blood-orange',
    name: 'San Pellegrino Aranciata Rossa (Blood Orange)',
    category: 'drinks',
    description: 'Vibrant sparkling Italian blood orange soda with subtle sweet-tart ruby citrus notes.',
    basePrice: 3.50,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegan', 'gluten-free'],
    calories: 140
  },
  {
    id: 'drink-mexican-coke',
    name: 'Mexican Coca-Cola (Glass Bottle 355ml)',
    category: 'drinks',
    description: 'Made with 100% pure cane sugar in the classic glass bottle for superior crisp carbonation.',
    basePrice: 3.75,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegan', 'gluten-free'],
    calories: 150
  },

  // Desserts
  {
    id: 'dessert-tiramisu',
    name: 'Nonna\'s Espresso Tiramisu Classico',
    category: 'desserts',
    description: 'Imported Savoiardi ladyfingers soaked in dark illy espresso, layered with whipped mascarpone cream and dusted with Valrhona cocoa.',
    basePrice: 8.50,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    isPopular: true,
    calories: 460
  },
  {
    id: 'dessert-cannoli',
    name: 'Crispy Sicilian Pistachio Cannoli (Duo)',
    category: 'desserts',
    description: 'Two golden fried pastry shells filled with sweet sheep’s milk ricotta, dark chocolate chips, and crushed Bronte pistachios.',
    basePrice: 7.50,
    image: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    calories: 390
  },
  {
    id: 'dessert-nutella-smores',
    name: 'Warm Nutella & Marshmallow S\'mores Calzone',
    category: 'desserts',
    description: 'Folded woodfire dough pocket bursting with molten Nutella hazelnut spread, roasted marshmallows, and graham cracker crumble.',
    basePrice: 9.00,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    calories: 610
  }
];

export const ACTIVE_PROMOS: PromoCode[] = [
  {
    code: 'PIZZA20',
    discountType: 'percent',
    discountValue: 20,
    minOrder: 25,
    description: '20% off entire order on orders over $25'
  },
  {
    code: 'FIRSTBITE',
    discountType: 'fixed',
    discountValue: 5,
    minOrder: 15,
    description: '$5 off your first artisan order'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 3.99,
    minOrder: 20,
    description: 'Free speedy moped delivery'
  },
  {
    code: 'CHEESELOVER',
    discountType: 'percent',
    discountValue: 15,
    minOrder: 20,
    description: '15% off any pizza with extra cheese'
  }
];
