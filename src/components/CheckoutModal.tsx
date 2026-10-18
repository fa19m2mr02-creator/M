import React, { useState } from 'react';
import { CartItem, PromoCode, Order } from '../types/pizza';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Phone, 
  User, 
  FileText, 
  CheckCircle, 
  Flame, 
  Bike,
  ShieldCheck
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedPromo: PromoCode | null;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  appliedPromo,
  onOrderPlaced,
}) => {
  const [address, setAddress] = useState('742 Evergreen Terrace, Apt 4B');
  const [name, setName] = useState('Alex Morgan');
  const [phone, setPhone] = useState('+1 (555) 789-2345');
  const [notes, setNotes] = useState('Please leave on front porch chair. Ring bell.');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'cash'>('apple_pay');
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);

  let discountAmount = 0;
  if (appliedPromo && subtotal >= appliedPromo.minOrder) {
    if (appliedPromo.discountType === 'percent') {
      discountAmount = (subtotal * appliedPromo.discountValue) / 100;
    } else if (appliedPromo.discountType === 'fixed') {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const deliveryFee = subtotal > 35 ? 0 : 3.99;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxableSubtotal * 0.0825;
  const tipAmount = (taxableSubtotal * tipPercent) / 100;
  const finalTotal = taxableSubtotal + deliveryFee + tax + tipAmount;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        orderId: `PZA-${randomId}`,
        createdAt: new Date().toISOString(),
        items: [...cart],
        subtotal,
        discount: discountAmount,
        tax,
        deliveryFee,
        tip: tipAmount,
        total: finalTotal,
        status: 'prep',
        statusTimestamp: Date.now(),
        estimatedDeliveryMinutes: 22,
        deliveryAddress: address,
        customerName: name,
        customerPhone: phone,
        notes,
        driver: {
          name: 'Marco Rossi',
          vehicle: 'Red Vespa Sprint 125',
          phone: '+1 (555) 438-2910',
          rating: 4.9,
          currentLocation: { lat: 40.7128, lng: -74.006 },
          targetLocation: { lat: 40.718, lng: -74.001 },
        },
      };

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Delivery Checkout</h2>
              <p className="text-xs text-stone-400">Fresh from our 800° woodfire oven to your table</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Delivery Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Delivery Destination</span>
            </h3>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Street Address & Unit</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Apt 4"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-300 block mb-1">Customer Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 block mb-1">Phone Number for Driver</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Delivery Instructions / Gate Code</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ring bell, leave on front bench"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Tip Selection */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                2. Courier Tip
              </label>
              <span className="text-xs text-amber-400 font-medium">
                ${tipAmount.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[15, 18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercent(pct)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    tipPercent === pct
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="pt-2 border-t border-stone-800 space-y-2.5">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              3. Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="text-xs"> Apple Pay</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Instant 1-Click</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">•••• 4242</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="text-xs">💵 Cash</div>
                <div className="text-[10px] text-stone-500 mt-0.5">At Door</div>
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5 text-xs text-stone-400">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((c, i) => c + i.quantity, 0)} items)</span>
              <span className="text-stone-200">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Discount ({appliedPromo?.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Speedy Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Courier Tip</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
              <span>Final Total</span>
              <span className="text-amber-400 text-base">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Security guarantee */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit encrypted secure woodfire checkout</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending Order to Woodfire Oven...</span>
            ) : (
              <span>Place Order (${finalTotal.toFixed(2)}) & Track Live</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
