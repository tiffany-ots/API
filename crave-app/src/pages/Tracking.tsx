import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle, Flame, ChefHat, UtensilsCrossed } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { formatTime, formatPrice } from '../lib/utils';

const STEPS = [
  { key: 'pending',   label: 'Commande reçue', icon: CheckCircle  },
  { key: 'preparing', label: 'En cuisine',      icon: Flame        },
  { key: 'ready',     label: 'Dressage',        icon: ChefHat      },
  { key: 'served',    label: 'À votre table',   icon: UtensilsCrossed },
];

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'served'];

export default function Tracking() {
  const { tableId, orderId } = useParams<{ tableId: string; orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useStore();
  const order = getOrderById(orderId!);

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!order) return;
    const computeRemaining = () => {
      const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
      const total = order.estimatedTime * 60;
      return Math.max(0, total - elapsed);
    };
    setRemaining(computeRemaining());
    const id = setInterval(() => setRemaining(computeRemaining()), 1000);
    return () => clearInterval(id);
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-c-bg flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-c-muted mb-4">Commande introuvable</p>
          <button onClick={() => navigate('/')} className="btn-primary px-8">Accueil</button>
        </div>
      </div>
    );
  }

  const totalSec = order.estimatedTime * 60;
  const elapsed = totalSec - remaining;
  const progress = Math.min(1, elapsed / totalSec);
  const currentStepIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen bg-c-bg pb-32">
      {/* Header */}
      <div className="glass border-b border-c-border px-5 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-c-orange rounded-xl flex items-center justify-center">
            <span className="text-lg">🍴</span>
          </div>
          <div>
            <p className="text-c-orange font-serif font-semibold text-base leading-none">Crave</p>
            <p className="text-c-muted text-xs mt-0.5">TABLE {tableId}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/menu/${tableId}`)} className="text-c-muted hover:text-white">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-5 pt-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-c-muted hover:text-white transition-colors mb-5 text-sm">
          <ArrowLeft size={16} /> Accueil
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              Suivi <span className="text-c-orange italic">en direct</span>
            </h1>
            <p className="text-c-muted text-sm mt-1">
              Table {order.tableNumber} • {order.items.reduce((s, c) => s + c.quantity, 0)} plat{order.items.reduce((s, c) => s + c.quantity, 0) > 1 ? 's' : ''}
            </p>
          </div>
          <span className="bg-c-card border border-c-border text-c-muted text-xs px-3 py-1.5 rounded-full font-mono">
            {orderId}
          </span>
        </div>

        {/* Countdown */}
        {order.status !== 'served' && order.status !== 'cancelled' && (
          <div className="card p-5 mb-6">
            <p className="text-c-muted text-xs uppercase tracking-wide text-center mb-3">Temps restant estimé</p>
            <p className="text-c-orange font-serif text-5xl font-bold text-center mb-4">
              {formatTime(Math.round(remaining))}
            </p>
            {/* Progress bar */}
            <div className="h-2 bg-c-deep rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-c-orange rounded-full transition-all duration-1000"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-c-muted text-xs text-center">⏱ Estimé : {order.estimatedTime} min</p>
          </div>
        )}

        {order.status === 'served' && (
          <div className="card p-5 mb-6 border-green-700/50 bg-green-900/20">
            <p className="text-green-400 font-semibold text-center text-lg">✅ Commande servie !</p>
            <p className="text-c-muted text-sm text-center mt-1">Bon appétit 🎉</p>
          </div>
        )}

        {/* Steps */}
        <div className="mb-6">
          <p className="text-c-muted text-xs uppercase tracking-wide mb-4">Étapes</p>
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const done    = idx < currentStepIdx;
              const current = idx === currentStepIdx;
              const Icon    = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
                      ${done || current ? 'bg-c-orange text-white' : 'bg-c-card border border-c-border text-c-muted'}`}>
                      <Icon size={18} />
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 my-1 ${done ? 'bg-c-orange' : 'bg-c-border'}`} />
                    )}
                  </div>
                  <div className="pt-2.5">
                    <p className={`font-medium ${done || current ? 'text-white' : 'text-c-muted'}`}>{step.label}</p>
                    {current && (
                      <p className="text-c-gold text-xs mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-c-gold rounded-full animate-pulse" />
                        En cours...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-4 mb-4">
          <p className="text-c-muted text-xs uppercase tracking-wide mb-3">Votre commande</p>
          {order.items.map((ci) => (
            <div key={ci.menuItem.id} className="flex justify-between text-sm py-1">
              <span className="text-c-muted">{ci.quantity}× {ci.menuItem.name}</span>
              <span className="text-white">{formatPrice(ci.menuItem.price * ci.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-c-border mt-3 pt-3 flex justify-between">
            <span className="text-c-muted text-sm">Total payé</span>
            <span className="text-c-orange font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Call waiter */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-c-bg via-c-bg/95 to-transparent space-y-2">
        <button className="w-full flex items-center justify-center gap-2 border border-c-gold text-c-gold font-semibold rounded-2xl py-4 hover:bg-c-gold hover:text-c-bg transition-all">
          <Bell size={18} /> Appeler le serveur
        </button>
        <button onClick={() => navigate(`/menu/${tableId}`)} className="w-full text-c-muted text-sm py-2 hover:text-white transition-colors">
          Commander autre chose
        </button>
      </div>
    </div>
  );
}
