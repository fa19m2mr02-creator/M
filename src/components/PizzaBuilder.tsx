import React, { useState, useMemo } from 'react';
import { 
  PizzaSize, 
  PizzaCrust, 
  PizzaSauce, 
  PizzaCheese, 
  CustomPizzaConfig,
  MenuItem 
} from '../types/pizza';
import { 
  AVAILABLE_TOPPINGS, 
  SIZE_MULTIPLIERS, 
  CRUST_PRICING 
} from '../data/pizzaMenu';
import { 
  Sparkles, 
  Plus, 
  Check, 
  RotateCcw, 
  Flame, 
  Info, 
  ShoppingBag,
  ChefHat
} from 'lucide-react';

interface PizzaBuilderProps {
  onAddToCart: (customConfig: CustomPizzaConfig, price: number, calories: number) => void;
  onAskAI: (prompt: string) => void;
  initialConfig?: Partial<CustomPizzaConfig>;
}

export const PizzaBuilder: React.FC<PizzaBuilderProps> = ({
  onAddToCart,
  onAskAI,
  initialConfig,
}) => {
  const [size, setSize] = useState<PizzaSize>(initialConfig?.size || 'Large (14")');
  const [crust, setCrust] = useState<PizzaCrust>(initialConfig?.crust || 'Neapolitan Sourdough');
  const [sauce, setSauce] = useState<PizzaSauce>(initialConfig?.sauce || 'San Marzano Tomato');
  const [cheese, setCheese] = useState<PizzaCheese>(initialConfig?.cheese || 'Whole Milk Mozzarella');
  const [extraCheese, setExtraCheese] = useState<boolean>(initialConfig?.extraCheese || false);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(
    initialConfig?.toppings || ['pepperoni', 'fresh_basil', 'hot_honey']
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'meat' | 'veggie' | 'cheese' | 'finish'>('meat');

  // Calculate pricing & calories
  const { totalCost, totalCalories } = useMemo(() => {
    let cost = 14.0; // base artisan pie
    let cals = 950;

    // Size multiplier
    const sizeData = SIZE_MULTIPLIERS[size];
    cost += sizeData.price;
    cals = Math.round(cals * sizeData.calMultiplier);

    // Crust
    cost += CRUST_PRICING[crust];

    // Extra cheese
    if (extraCheese) {
      cost += 2.0;
      cals += 180;
    }

    // Toppings
    selectedToppings.forEach((topId) => {
      const topObj = AVAILABLE_TOPPINGS.find((t) => t.id === topId);
      if (topObj) {
        cost += topObj.price;
        cals += topObj.calories;
      }
    });

    return { totalCost: cost, totalCalories: cals };
  }, [size, crust, extraCheese, selectedToppings]);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const resetToClassic = () => {
    setSize('Large (14")');
    setCrust('Neapolitan Sourdough');
    setSauce('San Marzano Tomato');
    setCheese('Whole Milk Mozzarella');
    setExtraCheese(false);
    setSelectedToppings(['pepperoni', 'fresh_basil', 'hot_honey']);
  };

  const handleAddCustomToCart = () => {
    const config: CustomPizzaConfig = {
      size,
      crust,
      sauce,
      cheese,
      extraCheese,
      toppings: selectedToppings,
      specialInstructions: specialInstructions.trim() || undefined,
    };
    onAddToCart(config, totalCost, totalCalories);
  };

  // Sauce visual background
  const sauceBg = useMemo(() => {
    switch (sauce) {
      case 'San Marzano Tomato':
        return 'radial-gradient(circle, #b91c1c 20%, #991b1b 95%)';
      case 'Creamy Garlic Alfredo':
        return 'radial-gradient(circle, #fef3c7 20%, #fde68a 95%)';
      case 'Genovese Basil Pesto':
        return 'radial-gradient(circle, #15803d 20%, #166534 95%)';
      case 'Sweet Smoky BBQ':
        return 'radial-gradient(circle, #78350f 20%, #451a03 95%)';
      case 'Spicy Arrabiata':
        return 'radial-gradient(circle, #dc2626 20%, #7f1d1d 95%)';
      default:
        return '#b91c1c';
    }
  }, [sauce]);

  // Size scale
  const sizeScale = useMemo(() => {
    switch (size) {
      case 'Small (10")': return 'scale-90';
      case 'Medium (12")': return 'scale-95';
      case 'Large (14")': return 'scale-100';
      case 'Family XL (16")': return 'scale-105';
    }
  }, [size]);

  // Seeded positions for toppings to look natural & hand-crafted
  const toppingVisuals = useMemo(() => {
    return selectedToppings.map((topId) => {
      const topObj = AVAILABLE_TOPPINGS.find((t) => t.id === topId);
      if (!topObj) return null;

      // generate fixed deterministic coordinates around pizza
      const count = topId === 'pepperoni' ? 14 : topId === 'fresh_basil' ? 8 : 10;
      const items = [];
      for (let i = 0; i < count; i++) {
        // distribute in radial rings
        const angle = (i * (360 / count) + (topId.charCodeAt(0) * 11)) * (Math.PI / 180);
        const radius = 25 + ((i % 3) * 22) + ((topId.charCodeAt(topId.length - 1) % 5) * 3);
        const x = 50 + radius * Math.cos(angle) * 0.78;
        const y = 50 + radius * Math.sin(angle) * 0.78;
        const rotation = (i * 47) % 360;

        items.push({ x, y, rotation, id: `${topId}-${i}` });
      }

      return {
        id: topId,
        topping: topObj,
        items,
      };
    }).filter(Boolean);
  }, [selectedToppings]);

  return (
    <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 lg:p-8 shadow-2xl border border-stone-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs tracking-wider uppercase font-semibold">
            <ChefHat className="w-4 h-4" />
            <span>Artisan Woodfire Studio</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mt-1">
            Build Your Custom Masterpiece
          </h2>
          <p className="text-stone-400 text-sm mt-0.5">
            Hand-stretched 72-hour fermented dough baked at 800°F
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskAI(`Nonna, please design an incredible custom woodfire pizza for me with artisan toppings!`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-sm font-medium transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ask AI to Style</span>
          </button>
          <button
            onClick={resetToClassic}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Reset to Nonna's Classic"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Interactive Pizza Visual Canvas */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-stone-950/80 rounded-2xl border border-stone-800/80 relative overflow-hidden">
          {/* Wood Board / Peel */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-stone-950 to-stone-900 pointer-events-none opacity-50" />
          
          <div className={`relative w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 transition-transform duration-500 ease-out ${sizeScale}`}>
            {/* Pizza Crust Rim */}
            <div className="absolute inset-0 rounded-full shadow-2xl bg-gradient-to-br from-[#c8894e] via-[#dfa569] to-[#9c6332] p-4 flex items-center justify-center border-4 border-[#864c20]/60">
              {/* Woodfire blister dots on crust edge */}
              <div className="absolute top-3 left-12 w-3 h-2 rounded-full bg-[#3d1e06] opacity-80" />
              <div className="absolute bottom-6 right-14 w-4 h-2.5 rounded-full bg-[#271304] opacity-85 rotate-45" />
              <div className="absolute top-1/2 left-2 w-3 h-3 rounded-full bg-[#341a05] opacity-75" />
              <div className="absolute top-8 right-16 w-3.5 h-2 rounded-full bg-[#2a1403] opacity-80 -rotate-12" />

              {/* Sauce Base Layer */}
              <div 
                className="w-full h-full rounded-full transition-all duration-300 relative overflow-hidden shadow-inner flex items-center justify-center"
                style={{ background: sauceBg }}
              >
                {/* Melted Cheese Layer */}
                {cheese !== 'No Cheese (Marinara Style)' && (
                  <div 
                    className={`w-[93%] h-[93%] rounded-full shadow-inner transition-all duration-300 relative ${
                      cheese === 'Vegan Cashew Mozzarella' 
                        ? 'bg-amber-100/85' 
                        : cheese === 'Four Cheese Blend' 
                        ? 'bg-amber-200/90' 
                        : 'bg-amber-50/90'
                    }`}
                  >
                    {/* Golden toasted blister marks */}
                    <div className="absolute top-1/4 left-1/3 w-6 h-5 rounded-full bg-amber-400/40 blur-xs" />
                    <div className="absolute bottom-1/3 right-1/4 w-8 h-6 rounded-full bg-amber-500/35 blur-xs" />
                    <div className="absolute top-1/2 right-1/3 w-5 h-4 rounded-full bg-amber-600/30 blur-xs" />
                    {extraCheese && (
                      <div className="absolute inset-0 rounded-full bg-amber-300/30 mix-blend-overlay animate-pulse" />
                    )}
                  </div>
                )}

                {/* Render Selected Toppings on Canvas */}
                {toppingVisuals.map((group) => {
                  if (!group) return null;
                  const { topping, items } = group;

                  return items.map((it) => {
                    if (topping.id === 'pepperoni') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-8 h-8 rounded-full border-2 border-red-950 shadow-md flex items-center justify-center transition-all duration-300"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%) rotate(${it.rotation}deg)`,
                            background: 'radial-gradient(circle, #b91c1c 45%, #7f1d1d 95%)',
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300/40" />
                        </div>
                      );
                    }

                    if (topping.id === 'fresh_basil') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-7 h-4 rounded-full bg-emerald-700 border border-emerald-900 shadow-sm"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%) rotate(${it.rotation}deg)`,
                          }}
                        >
                          <div className="w-full h-0.5 bg-emerald-500/60 mt-1.5" />
                        </div>
                      );
                    }

                    if (topping.id === 'mushrooms') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-6 h-5 rounded-t-full bg-stone-300 border border-stone-500 shadow-sm"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%) rotate(${it.rotation}deg)`,
                          }}
                        >
                          <div className="w-1.5 h-2 bg-stone-400 mx-auto mt-2" />
                        </div>
                      );
                    }

                    if (topping.id === 'kalamata_olives') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-4 h-4 rounded-full bg-stone-900 border-2 border-stone-700 shadow-xs flex items-center justify-center"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%)`,
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-100/60" />
                        </div>
                      );
                    }

                    if (topping.id === 'jalapenos') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-5 h-5 rounded-full border-2 border-emerald-700 shadow-xs bg-emerald-800/40 flex items-center justify-center"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%) rotate(${it.rotation}deg)`,
                          }}
                        >
                          <div className="w-1 h-1 rounded-full bg-amber-200" />
                        </div>
                      );
                    }

                    if (topping.id === 'hot_honey') {
                      return (
                        <div
                          key={it.id}
                          className="absolute w-2 h-4 rounded-full bg-amber-400/80 blur-[0.5px] shadow-sm rotate-45"
                          style={{
                            left: `${it.x}%`,
                            top: `${it.y}%`,
                            transform: `translate(-50%, -50%)`,
                          }}
                        />
                      );
                    }

                    // Generic topping marker
                    return (
                      <div
                        key={it.id}
                        className="absolute w-4 h-4 rounded-full shadow-sm"
                        style={{
                          left: `${it.x}%`,
                          top: `${it.y}%`,
                          backgroundColor: topping.color,
                          transform: `translate(-50%, -50%) rotate(${it.rotation}deg)`,
                        }}
                      />
                    );
                  });
                })}
              </div>
            </div>
          </div>

          {/* Canvas Stats Bar */}
          <div className="w-full mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. {totalCalories} kcal</span>
            </div>
            <span>{selectedToppings.length} custom toppings</span>
            <div className="font-semibold text-amber-300 text-sm">
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          {/* 1. Size Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2">
              1. Select Size & Slices
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Small (10")', 'Medium (12")', 'Large (14")', 'Family XL (16")'] as PizzaSize[]).map((s) => {
                const isSelected = size === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="truncate">{s}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {SIZE_MULTIPLIERS[s].sliceCount} slices
                      {SIZE_MULTIPLIERS[s].price > 0 && ` (+$${SIZE_MULTIPLIERS[s].price.toFixed(2)})`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Crust Style */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2">
              2. Dough & Crust Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  'Neapolitan Sourdough',
                  'New York Thin & Crispy',
                  'Hand-Tossed Classic',
                  'Garlic Herb Stuffed Crust',
                  'Cauliflower Gluten-Free',
                ] as PizzaCrust[]
              ).map((c) => {
                const isSelected = crust === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCrust(c)}
                    className={`p-2 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="truncate">{c}</div>
                    {CRUST_PRICING[c] > 0 && (
                      <div className="text-[10px] text-amber-400 mt-0.5">
                        +${CRUST_PRICING[c].toFixed(2)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sauce & Cheese Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5">
                3. Sauce Base
              </label>
              <select
                value={sauce}
                onChange={(e) => setSauce(e.target.value as PizzaSauce)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="San Marzano Tomato">San Marzano D.O.P. Tomato</option>
                <option value="Creamy Garlic Alfredo">Creamy Garlic Alfredo</option>
                <option value="Genovese Basil Pesto">Genovese Basil Pesto</option>
                <option value="Sweet Smoky BBQ">Sweet Smoky BBQ</option>
                <option value="Spicy Arrabiata">Spicy Arrabiata</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  4. Cheese
                </label>
                <button
                  type="button"
                  onClick={() => setExtraCheese(!extraCheese)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                    extraCheese 
                      ? 'bg-amber-500 text-stone-950 font-semibold' 
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {extraCheese ? 'Double Cheese ✓' : '+ Extra Cheese ($2)'}
                </button>
              </div>
              <select
                value={cheese}
                onChange={(e) => setCheese(e.target.value as PizzaCheese)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Whole Milk Mozzarella">Whole Milk Mozzarella</option>
                <option value="Fior di Latte">Fresh Fior di Latte</option>
                <option value="Four Cheese Blend">Four Cheese Blend (Gorgonzola/Fontina)</option>
                <option value="Vegan Cashew Mozzarella">Vegan Cashew Mozzarella</option>
                <option value="No Cheese (Marinara Style)">No Cheese (Marinara Style)</option>
              </select>
            </div>
          </div>

          {/* 4. Toppings Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                5. Gourmet Fire-Roasted Toppings
              </label>
              <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                {(['meat', 'veggie', 'finish'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                      activeCategory === cat
                        ? 'bg-stone-800 text-amber-300'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat}s
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {AVAILABLE_TOPPINGS.filter((t) => t.category === activeCategory).map((topping) => {
                const isSelected = selectedToppings.includes(topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-stone-800/80 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-medium text-stone-200 truncate">{topping.name}</div>
                      <div className="text-[10px] text-stone-500">+${topping.price.toFixed(2)}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-1.5 transition-colors ${
                        isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-stone-400 text-xs w-full sm:w-auto">
              <Info className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Baked fresh in under 4 minutes at 800°F</span>
            </div>

            <button
              onClick={handleAddCustomToCart}
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Custom Pie (${totalCost.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
