import React, { useState } from 'react';
import { CartItem, PromoCode } from '../types/pizza';
import { ACTIVE_PROMOS } from '../data/pizzaMenu';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  Check
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedPromo: PromoCode | null;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onApplyPromo: (code: string) => boolean;
  onRemovePromo: () => void;
  onProceedToCheckout: () => void;
  onAskAI: (prompt: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  appliedPromo,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromo,
  onRemovePromo,
  onProceedToCheckout,
  onAskAI,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);

  let discountAmount = 0;
  if (appliedPromo && subtotal >= appliedPromo.minOrder) {
    if (appliedPromo.discountType === 'percent') {
      discountAmount = (subtotal * appliedPromo.discountValue) / 100;
    } else if (appliedPromo.discountType === 'fixed') {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const deliveryFee = subtotal === 0 ? 0 : subtotal > 35 ? 0 : 3.99;
  const tax = subtotal === 0 ? 0 : (subtotal - discountAmount) * 0.0825;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const success = onApplyPromo(code);
    if (!success) {
      setPromoError('Invalid promo code. Try PIZZA20 or FIRSTBITE!');
    } else {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md h-full bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col text-stone-100">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Your Pizza Cart</h2>
              <p className="text-xs text-stone-400">
                {cart.reduce((c, i) => c + i.quantity, 0)} {cart.length === 1 ? 'item' : 'items'} ready for the oven
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-950/40">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-stone-800/80 flex items-center justify-center text-stone-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Your cart is empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Ask Nonna to recommend a delicious combo or explore our woodfire specialty pies!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onAskAI('Nonna, what is your most popular woodfire pizza combo?');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI for a Meal Combo</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800/90 shadow-sm flex flex-col space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {item.menuItem?.name || item.size || 'Custom Pizza'}
                    </h4>
                    
                    {item.size && (
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {item.size} · {item.crust}
                      </p>
                    )}

                    {item.toppings && item.toppings.length > 0 && (
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        Toppings: {item.toppings.join(', ')}
                      </p>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[10px] text-stone-400 italic mt-0.5">
                        Note: "{item.specialInstructions}"
                      </p>
                    )}
                  </div>

                  <span className="font-bold text-stone-200 text-sm">
                    ${(item.itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/70 text-xs">
                  <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                      className="p-1 rounded text-stone-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-white text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      className="p-1 rounded text-stone-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3.5 shrink-0">
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>
                      Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.description})
                    </span>
                  </div>
                  <button
                    onClick={onRemovePromo}
                    className="text-[10px] text-stone-400 hover:text-white underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. PIZZA20)"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-red-400 mt-1 pl-1">{promoError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-200">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promo Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Speedy Moped Delivery</span>
                <span className="text-stone-200">
                  {deliveryFee === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.25%)</span>
                <span className="text-stone-200">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
                <span>Total</span>
                <span className="text-amber-400 text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
