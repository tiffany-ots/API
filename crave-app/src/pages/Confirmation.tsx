import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, RotateCcw, User } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../lib/utils';

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_momo:     'MTN MoMo',
  cash:         'Espèces',
};

export default function Confirmation() {
  const { tableId, orderId } = useParams<{ tableId: string; orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useStore();
  const order = getOrderById(orderId!);

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

  return (
    <div className="min-h-screen bg-c-bg flex flex-col items-center justify-start pt-16 px-5 pb-10 animate-fade-in">
      {/* Checkmark */}
      <div className="w-20 h-20 bg-c-orange rounded-full flex items-center justify-center mb-6 shadow-lg shadow-c-orange/30">
        <CheckCircle size={40} className="text-white" />
      </div>

      <p className="text-c-gold text-xs font-semibold tracking-widest uppercase mb-2">
        ✦ Commande confirmée ✦
      </p>
      <h1 className="font-serif text-4xl font-bold text-c-orange italic text-center mb-3">
        Régalez-vous&nbsp;!
      </h1>
      <p className="text-white/70 text-center text-base mb-6 px-4">
        Merci pour votre commande. Notre équipe est déjà en cuisine pour vous concocter ça avec amour.&nbsp;🔥
      </p>

      {/* Order ID */}
      <div className="flex items-center gap-2 border border-c-border rounded-full px-4 py-2 mb-8">
        <span className="text-c-orange">💲</span>
        <span className="text-white font-mono font-semibold text-sm">N° {order.id}</span>
      </div>

      {/* Time + Details card */}
      <div className="card w-full p-5 mb-5">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-c-border">
          <Clock size={22} className="text-c-orange" />
          <div>
            <p className="text-c-muted text-xs uppercase tracking-wide">Apporté à votre table dans</p>
            <p className="text-white font-serif text-2xl font-bold">~ {order.estimatedTime} minutes</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5 text-center">
          <div>
            <p className="text-c-muted text-xs uppercase tracking-wide mb-1">Table</p>
            <p className="text-c-gold font-bold text-lg">{order.tableNumber}</p>
          </div>
          <div>
            <p className="text-c-muted text-xs uppercase tracking-wide mb-1">Paiement</p>
            <p className="text-white font-semibold text-sm">{PAYMENT_LABELS[order.paymentMethod]}</p>
          </div>
          <div>
            <p className="text-c-muted text-xs uppercase tracking-wide mb-1">Total</p>
            <p className="text-c-orange font-bold text-base">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="border-t border-c-border pt-4">
          <p className="text-c-muted text-xs uppercase tracking-wide mb-2">Vos plats</p>
          {order.items.map((ci) => (
            <div key={ci.menuItem.id} className="flex justify-between text-sm py-1">
              <span className="text-c-muted">{ci.quantity}× {ci.menuItem.name}</span>
              <span className="text-white">{formatPrice(ci.menuItem.price * ci.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <button
        onClick={() => navigate(`/tracking/${tableId}/${order.id}`)}
        className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
      >
        Suivre ma commande <ArrowRight size={16} />
      </button>
      <button
        onClick={() => navigate(`/menu/${tableId}`)}
        className="w-full border border-c-orange text-c-orange font-semibold rounded-2xl py-4 hover:bg-c-orange hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
      >
        <User size={16} /> Créer un compte pour garder l'historique
      </button>
      <button
        onClick={() => navigate('/')}
        className="w-full text-c-muted font-medium rounded-2xl py-4 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw size={14} /> Nouvelle commande
      </button>
    </div>
  );
}
