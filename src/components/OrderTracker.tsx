import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/pizza';
import { 
  CheckCircle2, 
  Flame, 
  ChefHat, 
  Sparkles, 
  Bike, 
  Home, 
  Phone, 
  Clock, 
  MapPin, 
  X, 
  Play, 
  Pause,
  Receipt
} from 'lucide-react';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrderStatus?: (status: OrderStatus) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'received',
    label: 'Order Confirmed',
    desc: 'Ticket printed & 72h sourdough dough selected',
    icon: CheckCircle2,
  },
  {
    status: 'prep',
    label: 'Handcrafting & Topping',
    desc: 'Hand-stretched dough & fresh San Marzano sauce applied',
    icon: ChefHat,
  },
  {
    status: 'baking',
    label: 'In 800° Woodfire Oven',
    desc: 'Baking on volcanic stone for authentic crust blisters',
    icon: Flame,
  },
  {
    status: 'quality_check',
    label: 'Boxing & Fresh Herb Finish',
    desc: 'Fresh basil & hot honey drizzle added, heat-sealed box',
    icon: Sparkles,
  },
  {
    status: 'out_for_delivery',
    label: 'Driver On The Way',
    desc: 'Marco is zipping through town on his Vespa',
    icon: Bike,
  },
  {
    status: 'delivered',
    label: 'Delivered at Doorstep',
    desc: 'Buon Appetito! Enjoy your piping hot pizza!',
    icon: Home,
  },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateOrderStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'baking');
  const [driverProgress, setDriverProgress] = useState<number>(45); // 0 to 100%
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [etaMinutes, setEtaMinutes] = useState<number>(order?.estimatedDeliveryMinutes || 18);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  // Fast-forward simulation mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        const statuses: OrderStatus[] = ['received', 'prep', 'baking', 'quality_check', 'out_for_delivery', 'delivered'];
        setCurrentStatus((prev) => {
          const idx = statuses.indexOf(prev);
          if (idx < statuses.length - 1) {
            const next = statuses[idx + 1];
            onUpdateOrderStatus?.(next);
            setEtaMinutes((m) => Math.max(0, m - 4));
            return next;
          } else {
            setIsSimulating(false);
            return 'delivered';
          }
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, onUpdateOrderStatus]);

  // Animate driver progress along route when out for delivery
  useEffect(() => {
    let animInterval: NodeJS.Timeout;
    if (currentStatus === 'out_for_delivery') {
      animInterval = setInterval(() => {
        setDriverProgress((prev) => {
          if (prev >= 98) {
            setCurrentStatus('delivered');
            onUpdateOrderStatus?.('delivered');
            setEtaMinutes(0);
            return 100;
          }
          return prev + 2;
        });
      }, 1000);
    } else if (currentStatus === 'delivered') {
      setDriverProgress(100);
      setEtaMinutes(0);
    }
    return () => clearInterval(animInterval);
  }, [currentStatus, onUpdateOrderStatus]);

  if (!isOpen) return null;

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === currentStatus);

  const advanceStep = () => {
    const statuses: OrderStatus[] = ['received', 'prep', 'baking', 'quality_check', 'out_for_delivery', 'delivered'];
    const idx = statuses.indexOf(currentStatus);
    if (idx < statuses.length - 1) {
      const next = statuses[idx + 1];
      setCurrentStatus(next);
      onUpdateOrderStatus?.(next);
      if (next === 'out_for_delivery') {
        setDriverProgress(20);
        setEtaMinutes(10);
      } else if (next === 'delivered') {
        setDriverProgress(100);
        setEtaMinutes(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Live Woodfire Tracker
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mt-0.5">
              Order #{order?.orderId || 'PZA-8492'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSimulating 
                  ? 'bg-amber-500 text-stone-950' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulating ? 'Fast Simulating...' : 'Demo Fast Run'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estimated Arrival Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-stone-900 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                  {currentStatus === 'delivered' ? 'Delivery Completed' : 'Estimated Arrival'}
                </p>
                <div className="text-2xl font-serif font-bold text-white">
                  {currentStatus === 'delivered' ? 'Arrived & Enjoy!' : `${etaMinutes} Minutes`}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block">Deliver to:</span>
              <span className="text-sm font-medium text-stone-200">
                {order?.deliveryAddress || '742 Evergreen Terrace, Apt 4B'}
              </span>
            </div>
          </div>

          {/* Interactive Live Map Simulator */}
          <div className="relative h-44 rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden flex flex-col justify-end p-4 shadow-inner">
            {/* Stylized Street Grid Background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 10px 10px, #e2e8f0 1.5px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            
            {/* Route Line */}
            <div className="absolute top-1/2 left-10 right-10 h-1.5 bg-stone-800 -translate-y-1/2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 ease-out"
                style={{ width: `${driverProgress}%` }}
              />
            </div>

            {/* Pizzeria Marker */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-stone-900 shadow-lg flex items-center justify-center text-white">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-stone-400 font-semibold mt-1">Nonna's</span>
            </div>

            {/* Moving Driver Marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out flex flex-col items-center z-10"
              style={{ left: `calc(32px + (100% - 64px) * ${driverProgress / 100})` }}
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 border-2 border-white shadow-xl flex items-center justify-center animate-bounce">
                <Bike className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] text-amber-300 font-bold bg-stone-900/90 px-1.5 py-0.5 rounded shadow-xs mt-1">
                Marco
              </span>
            </div>

            {/* Destination Marker */}
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-lg flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-stone-400 font-semibold mt-1">Your Door</span>
            </div>

            {/* Driver Profile Bar */}
            <div className="relative z-10 mt-auto bg-stone-900/95 backdrop-blur-md p-3 rounded-xl border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center font-bold text-amber-400 border border-stone-700">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Marco Rossi</span>
                    <span className="text-[10px] text-amber-400 font-normal">★ 4.9 (1,240 deliveries)</span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Vespa Sprint · Hot Pizza Thermal Pod
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Calling driver Marco: +1 (555) 438-2910')}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Stages */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Prep & Delivery Journey
            </h3>

            <div className="space-y-3">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isUpcoming = idx > currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.status}
                    className={`flex items-start gap-4 p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md'
                        : isPassed
                        ? 'bg-stone-900/60 border-stone-800 text-stone-300'
                        : 'bg-stone-950/40 border-stone-900 text-stone-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-600'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-amber-300' : ''}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                            Active Now
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[11px] text-emerald-400 font-medium">Done ✓</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Dropdown/Items */}
          {order && order.items.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-stone-500" />
                  <span>Items In This Order ({order.items.length})</span>
                </div>
                <span className="text-white font-bold text-sm">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              <div className="divide-y divide-stone-800 text-xs">
                {order.items.map((item) => (
                  <div key={item.cartItemId} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-stone-200">
                        {item.quantity}x {item.menuItem?.name || item.size || 'Pizza'}
                      </span>
                      {item.crust && (
                        <span className="text-[11px] text-stone-500 block">
                          {item.crust} · {item.size}
                        </span>
                      )}
                    </div>
                    <span className="text-stone-300 font-medium">
                      ${(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={advanceStep}
            disabled={currentStatus === 'delivered'}
            className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
          >
            Advance to Next Step (Demo)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
