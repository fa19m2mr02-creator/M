import React, { useState, useMemo } from 'react';
import { 
  MenuItem, 
  CartItem, 
  CustomPizzaConfig, 
  DietaryPreference, 
  PromoCode, 
  Order, 
  OrderStatus, 
  AgentAction,
  PizzaSize 
} from './types/pizza';
import { 
  MENU_ITEMS, 
  ACTIVE_PROMOS, 
  SIZE_MULTIPLIERS,
  CRUST_PRICING 
} from './data/pizzaMenu';
import { PizzaBuilder } from './components/PizzaBuilder';
import { AIAgentChat } from './components/AIAgentChat';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { 
  Flame, 
  ShoppingBag, 
  Sparkles, 
  Search, 
  Plus, 
  Mic, 
  Bike, 
  ChevronRight, 
  ChefHat, 
  HeartHandshake, 
  Clock, 
  Check, 
  Star,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  // Navigation & Filter state
  const [activeCategory, setActiveCategory] = useState<'all' | 'specialty' | 'sides' | 'drinks' | 'desserts'>('all');
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Promo state
  const [cart, setCart] = useState<CartItem[]>([
    {
      cartItemId: 'init-1',
      menuItem: MENU_ITEMS[0], // The Godfather Diablo
      size: 'Large (14")',
      crust: 'Neapolitan Sourdough',
      toppings: ['pepperoni', 'jalapenos', 'hot_honey'],
      quantity: 1,
      itemPrice: 19.50,
      specialInstructions: 'Crispy crust please',
    },
    {
      cartItemId: 'init-2',
      menuItem: MENU_ITEMS[7], // Truffle Garlic Knots
      quantity: 1,
      itemPrice: 7.50,
    }
  ]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Active Order & Modals
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cart operations
  const handleAddToCart = (
    item: MenuItem, 
    size?: PizzaSize, 
    customInstructions?: string,
    quantity = 1
  ) => {
    const itemSize = size || item.defaultSize || 'Large (14")';
    let calculatedPrice = item.basePrice;
    if (item.category === 'specialty' && SIZE_MULTIPLIERS[itemSize]) {
      calculatedPrice += SIZE_MULTIPLIERS[itemSize].price;
    }

    const newItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}`,
      menuItem: item,
      size: item.category === 'specialty' ? itemSize : undefined,
      crust: item.defaultCrust,
      sauce: item.defaultSauce,
      toppings: item.defaultToppings,
      quantity,
      itemPrice: calculatedPrice,
      specialInstructions: customInstructions,
    };

    setCart((prev) => [...prev, newItem]);
    showToast(`Added ${item.name} to cart!`);
  };

  const handleAddCustomPizzaToCart = (
    customConfig: CustomPizzaConfig, 
    price: number
  ) => {
    const customItem: CartItem = {
      cartItemId: `custom-pie-${Date.now()}`,
      menuItem: {
        id: 'pizza-custom-studio',
        name: `Custom ${customConfig.size} Woodfire Pie`,
        category: 'custom',
        description: `${customConfig.crust} with ${customConfig.sauce}, ${customConfig.cheese}`,
        basePrice: price,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
        dietary: [],
      },
      size: customConfig.size,
      crust: customConfig.crust,
      sauce: customConfig.sauce,
      cheese: customConfig.cheese,
      extraCheese: customConfig.extraCheese,
      toppings: customConfig.toppings,
      quantity: 1,
      itemPrice: price,
      specialInstructions: customConfig.specialInstructions,
    };

    setCart((prev) => [...prev, customItem]);
    showToast(`Added Custom Woodfire Pie to cart ($${price.toFixed(2)})!`);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    showToast('Item removed from cart');
  };

  const handleApplyPromo = (code: string): boolean => {
    const found = ACTIVE_PROMOS.find((p) => p.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setAppliedPromo(found);
      showToast(`Promo ${found.code} applied: ${found.description}!`);
      return true;
    }
    return false;
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('Promo code removed');
  };

  // AI Agent Action Execution
  const handleExecuteAgentAction = (action: AgentAction) => {
    switch (action.type) {
      case 'ADD_TO_CART': {
        const payload = action.payload;
        if (!payload) return;
        const targetItem = MENU_ITEMS.find((m) => 
          m.id === payload.itemId || 
          m.name.toLowerCase().includes((payload.itemName || '').toLowerCase())
        ) || MENU_ITEMS[0];

        handleAddToCart(
          targetItem, 
          payload.size as PizzaSize, 
          payload.specialInstructions, 
          payload.quantity || 1
        );
        break;
      }
      case 'APPLY_PROMO': {
        const code = action.payload?.code || 'PIZZA20';
        handleApplyPromo(code);
        break;
      }
      case 'CUSTOMIZE_PIZZA': {
        const customStudioElem = document.getElementById('custom-pizza-studio');
        customStudioElem?.scrollIntoView({ behavior: 'smooth' });
        showToast('Opened Pizza Customizer Studio');
        break;
      }
      case 'TRACK_ORDER': {
        setIsTrackerOpen(true);
        break;
      }
      case 'OPEN_CHECKOUT': {
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
        break;
      }
      case 'CLEAR_CART': {
        setCart([]);
        showToast('Cart cleared');
        break;
      }
    }
  };

  const handleOrderPlaced = (order: Order) => {
    setActiveOrder(order);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsTrackerOpen(true);
    showToast(`Order #${order.orderId} sent to our 800° woodfire oven!`);
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Exclude base custom studio item from standard category grid since it has its own dedicated studio section
      if (item.id === 'pizza-custom-studio') return false;

      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'specialty' && item.category !== 'specialty') return false;
        if (activeCategory === 'sides' && item.category !== 'sides') return false;
        if (activeCategory === 'drinks' && item.category !== 'drinks') return false;
        if (activeCategory === 'desserts' && item.category !== 'desserts') return false;
      }

      // Dietary filter
      if (selectedDietary !== 'all') {
        if (!item.dietary.includes(selectedDietary)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [activeCategory, selectedDietary, searchQuery]);

  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500 text-stone-950 px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/25">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl tracking-tight text-white">
                  NONNA'S
                </span>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold hidden sm:inline">
                  Woodfire Pizza
                </span>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Oven at 800°F</span>
                <span aria-hidden="true">·</span>
                <span>Avg delivery 22m</span>
              </p>
            </div>
          </div>

          {/* Right Action Island */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Order Tracker Button */}
            {activeOrder && (
              <button
                onClick={() => setIsTrackerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all animate-pulse"
              >
                <Bike className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Track #{activeOrder.orderId}</span>
                <span className="sm:hidden">Tracking</span>
              </button>
            )}

            {/* AI Agent Concierge Trigger */}
            <button
              onClick={() => setIsAgentOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 hover:brightness-110 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Talk to Pizza AI</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-10">
        {/* Hero Banner with Conversational AI Prompt Bar */}
        <section className="relative rounded-3xl overflow-hidden border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 shadow-2xl p-6 sm:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <ChefHat className="w-4 h-4" />
              <span>Authentic Neapolitan Sourdough · San Marzano D.O.P.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight leading-tight">
              Artisan Woodfire Pies, Handcrafted with Passion &amp; AI Intelligence
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Order via voice or chat with <strong className="text-amber-400">Nonna Gina AI</strong>. 
              Customize your toppings in real-time, grab family combos, and track our moped courier from the 800° stone oven to your door.
            </p>

            {/* Quick Interactive Prompt Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div 
                onClick={() => setIsAgentOpen(true)}
                className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-900/90 hover:bg-stone-900 border border-stone-700/80 rounded-2xl cursor-pointer shadow-inner transition-all hover:border-amber-500/50 group"
              >
                <Mic className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-stone-400 group-hover:text-stone-200">
                  "Nonna, order dinner for 4 with spicy pepperoni and garlic knots..."
                </span>
                <span className="ml-auto text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded font-mono">
                  Voice / AI
                </span>
              </div>

              <a
                href="#custom-pizza-studio"
                className="px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs text-center border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Studio</span>
              </a>
            </div>

            {/* Unboxed Highlights & Value props (Clean typographic metadata) */}
            <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
              <span className="text-stone-300 font-medium">✨ 72-Hour Fermented Dough</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-medium">🔥 800° Volcanic Stone Oven</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-medium">🛵 Free Delivery Over $35</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-medium">🏷️ Code PIZZA20 for 20% Off</span>
            </div>
          </div>
        </section>

        {/* Menu Navigation & Category Filter Controls */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Tabs (Interactive Filter Controls) */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Items' },
                  { id: 'specialty', label: 'Artisan Pizzas' },
                  { id: 'sides', label: 'Starters & Sides' },
                  { id: 'drinks', label: 'Craft Sodas & Drinks' },
                  { id: 'desserts', label: 'Italian Dolci' },
                ] as const
              ).map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, wings, truffle..."
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Dietary Filter Segmented Controls */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap mr-1">
              Dietary:
            </span>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'vegan', label: 'Vegan Plant-Based' },
                { id: 'gluten-free', label: 'Gluten-Free' },
                { id: 'halal', label: 'Halal Certified' },
                { id: 'spicy', label: 'Spicy & Hot' },
              ] as const
            ).map((d) => {
              const isSelected = selectedDietary === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDietary(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-800 text-amber-400 border border-amber-500/40'
                      : 'text-stone-400 hover:text-stone-200 border border-transparent hover:border-stone-800'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white">
              {activeCategory === 'all' ? 'Featured Woodfire Specialties' : activeCategory.toUpperCase()}
            </h2>
            <span className="text-xs text-stone-400">
              Showing {filteredMenuItems.length} recipes
            </span>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-900/50 border border-stone-800">
              <p className="text-stone-400 text-sm">No dishes match your active filters.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedDietary('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-stone-900 border border-stone-800/90 rounded-3xl overflow-hidden shadow-lg hover:border-stone-700 transition-all flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-stone-950">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                    {/* Unboxed subtle metadata badge on image */}
                    {item.isPopular && (
                      <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Chef's Choice</span>
                      </div>
                    )}

                    {item.isSpicy && (
                      <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-500/30 text-red-300 text-[10px] font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        <span>Hot &amp; Spicy</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
                      <span className="text-xl font-serif font-black text-white">
                        ${item.basePrice.toFixed(2)}
                      </span>
                      {item.calories && (
                        <span className="text-[11px] text-stone-300 font-medium">
                          {item.calories} kcal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Dietary text line without pills */}
                      {item.dietary.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-medium capitalize mb-1">
                          {item.dietary.map((d, i) => (
                            <React.Fragment key={d}>
                              <span>{d}</span>
                              {i < item.dietary.length - 1 && <span aria-hidden="true">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-stone-400 text-xs mt-1 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Row */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add to Cart</span>
                      </button>

                      {item.category === 'specialty' && (
                        <button
                          onClick={() => {
                            const customElem = document.getElementById('custom-pizza-studio');
                            customElem?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                          title="Customize dough, crust & toppings"
                        >
                          Modify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dedicated Interactive Custom Pizza Studio */}
        <section id="custom-pizza-studio" className="scroll-mt-24 pt-4">
          <PizzaBuilder
            onAddToCart={handleAddCustomPizzaToCart}
            onAskAI={(prompt) => {
              setIsAgentOpen(true);
            }}
          />
        </section>

        {/* Why Nonna's Woodfire Section */}
        <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-300 text-xs">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">800° Volcanic Stone Oven</h4>
            <p className="text-stone-400 leading-relaxed">
              We bake our pizzas on genuine Italian volcanic stone deck. High heat caramelizes crust bubbles in just 90 seconds while sealing in flavor.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">72-Hour Fermented Dough</h4>
            <p className="text-stone-400 leading-relaxed">
              Slow wild fermentation breaks down gluten structures for an airy, featherlight crust that's wonderfully digestible and naturally fragrant.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">Smart AI Pizza Concierge</h4>
            <p className="text-stone-400 leading-relaxed">
              Nonna Gina AI understands your dietary restrictions, pairs sides and drinks, calculates discounts, and dispatches drivers instantly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-800 bg-stone-950 py-10 px-4 lg:px-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-serif font-bold text-stone-300">Nonna's Woodfire Pizza</span>
            <span aria-hidden="true">·</span>
            <span>Artisan Woodfire Delivery &amp; AI Agent</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Volcanic Stone Pizzeria</span>
            <span aria-hidden="true">·</span>
            <span>Active Deals: PIZZA20 · FIRSTBITE</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2026</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Agent Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAgentOpen(true)}
          className="group relative flex items-center gap-3 p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-stone-950 font-bold text-xs shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          title="Open AI Pizza Concierge"
        >
          <div className="relative">
            <Flame className="w-5 h-5 text-stone-950 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-stone-950" />
          </div>

          <span className="hidden sm:inline font-bold tracking-wide">
            Order with Nonna AI
          </span>

          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
          </span>
        </button>
      </div>

      {/* Modals and Drawers */}
      <AIAgentChat
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        cart={cart}
        activeOrder={activeOrder}
        onExecuteAction={handleExecuteAgentAction}
        onOpenTracker={() => {
          setIsAgentOpen(false);
          setIsTrackerOpen(true);
        }}
        onOpenCheckout={() => {
          setIsAgentOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        appliedPromo={appliedPromo}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onAskAI={(prompt) => {
          setIsCartOpen(false);
          setIsAgentOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        appliedPromo={appliedPromo}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        order={activeOrder}
        onUpdateOrderStatus={(status: OrderStatus) => {
          if (activeOrder) {
            setActiveOrder({ ...activeOrder, status });
          }
        }}
      />
    </div>
  );
}
