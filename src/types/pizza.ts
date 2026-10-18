export type PizzaSize = 'Small (10")' | 'Medium (12")' | 'Large (14")' | 'Family XL (16")';

export type PizzaCrust = 
  | 'Hand-Tossed Classic'
  | 'Neapolitan Sourdough'
  | 'New York Thin & Crispy'
  | 'Garlic Herb Stuffed Crust'
  | 'Cauliflower Gluten-Free';

export type PizzaSauce = 
  | 'San Marzano Tomato'
  | 'Creamy Garlic Alfredo'
  | 'Spicy Arrabiata'
  | 'Sweet Smoky BBQ'
  | 'Genovese Basil Pesto';

export type PizzaCheese = 
  | 'Whole Milk Mozzarella'
  | 'Fior di Latte'
  | 'Four Cheese Blend'
  | 'Vegan Cashew Mozzarella'
  | 'No Cheese (Marinara Style)';

export interface ToppingOption {
  id: string;
  name: string;
  category: 'meat' | 'veggie' | 'cheese' | 'finish';
  price: number;
  calories: number;
  color: string;
  iconName: string;
}

export type DietaryPreference = 'all' | 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'spicy';

export interface MenuItem {
  id: string;
  name: string;
  category: 'specialty' | 'custom' | 'sides' | 'drinks' | 'desserts';
  description: string;
  basePrice: number;
  image: string;
  dietary: DietaryPreference[];
  isPopular?: boolean;
  isSpicy?: boolean;
  calories?: number;
  defaultSize?: PizzaSize;
  defaultCrust?: PizzaCrust;
  defaultSauce?: PizzaSauce;
  defaultToppings?: string[]; // topping ids
}

export interface CustomPizzaConfig {
  size: PizzaSize;
  crust: PizzaCrust;
  sauce: PizzaSauce;
  cheese: PizzaCheese;
  extraCheese: boolean;
  toppings: string[]; // topping IDs
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  size?: PizzaSize;
  crust?: PizzaCrust;
  sauce?: PizzaSauce;
  cheese?: PizzaCheese;
  extraCheese?: boolean;
  toppings?: string[]; // IDs
  quantity: number;
  itemPrice: number; // calculated single price
  specialInstructions?: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percent' | 'fixed' | 'free_item';
  discountValue: number;
  minOrder: number;
  description: string;
}

export type OrderStatus = 
  | 'received'
  | 'prep'
  | 'baking'
  | 'quality_check'
  | 'out_for_delivery'
  | 'delivered';

export interface Order {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  statusTimestamp: number;
  estimatedDeliveryMinutes: number;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  driver?: {
    name: string;
    vehicle: string;
    phone: string;
    rating: number;
    currentLocation: { lat: number; lng: number };
    targetLocation: { lat: number; lng: number };
  };
}

export interface AgentAction {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'CLEAR_CART' | 'APPLY_PROMO' | 'CUSTOMIZE_PIZZA' | 'TRACK_ORDER' | 'OPEN_CHECKOUT' | 'SHOW_MENU';
  payload?: any;
  displayText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actions?: AgentAction[];
  isVoiceInput?: boolean;
}
