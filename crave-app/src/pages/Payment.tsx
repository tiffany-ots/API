import { useState } from 'react';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import Header from '../components/Header';
import { formatPrice } from '../lib/utils';
import type { PaymentMethod } from '../types';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub: string; emoji: string; color: string; requiresPhone: boolean }[] = [
  { id: 'orange_money', label: 'Orange Money',   sub: 'Paiement instantané via Orange', emoji: '📱', color: 'bg-orange-500', requiresPhone: true  },
  { id: 'mtn_momo',    label: 'MTN MoMo',       sub: 'Mobile Money MTN',               emoji: '📱', color: 'bg-yellow-400', requiresPhone: true  },
  { id: 'cash',        label: 'Espèces',         sub: 'Réglez à la table',              emoji: '💵', color: 'bg-orange-700', requiresPhone: false },
];

export default function Payment() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { cart, getCartTotal, placeOrder, settings } = useStore();

  const [selected, setSelected] = useState<PaymentMethod>('orange_money');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = getCartTotal();
  const requiresPhone = PAYMENT_OPTIONS.find((p) => p.id === selected)?.requiresPhone;

  const handleConfirm = () => {
    if (requiresPhone && !phone.match(/^6\d{8}$/)) {
      setError('Numéro invalide (format : 6XX XXX XXX)');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const order = placeOrder(selected, requiresPhone ? phone : undefined);
      navigate(`/confirmation/${tableId}/${order.id}`);
    }, 800);
  };

  const availablePayments = PAYMENT_OPTIONS.filter((p) => settings.paymentMethods[p.id]);

  return (
    <div className="min-h-screen bg-c-bg pb-36">
      <Header tableId={tableId} />

      <div className="px-5 pt-5">
        <button onClick={() => navigate(`/cart/${tableId}`)} className="flex items-center gap-2 text-c-muted hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Retour au panier
        </button>

        <h1 className="font-serif text-4xl font-bold text-white mb-1">
          Mode de <span className="text-c-orange italic">paiement</span>
        </h1>
        <p className="text-c-muted text-sm mb-6">
          {cart.reduce((s, c) => s + c.quantity, 0)} article{cart.reduce((s, c) => s + c.quantity, 0) > 1 ? 's' : ''}{' '}
          • Table <span className="text-c-gold font-semibold">{tableId}</span>{' '}
          • <span className="text-c-gold font-semibold">{formatPrice(total)}</span>
        </p>

        {/* Recap */}
        <div className="card p-4 mb-6">
          <p className="text-c-muted text-xs uppercase tracking-wide mb-3">Récapitulatif</p>
          {cart.map((ci) => (
            <div key={ci.menuItem.id} className="flex justify-between text-sm py-1">
              <span className="text-c-muted">{ci.quantity}× {ci.menuItem.name}</span>
              <span className="text-white">{formatPrice(ci.menuItem.price * ci.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Payment options */}
        <div className="space-y-3 mb-6">
          {availablePayments.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setSelected(opt.id); setError(''); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all
                ${selected === opt.id ? 'border-c-orange bg-c-orange/10' : 'card hover:border-c-line'}`}
            >
              <div className={`w-12 h-12 ${opt.color} rounded-xl flex items-center justify-center text-xl shrink-0`}>
                {opt.emoji}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">{opt.label}</p>
                <p className="text-c-muted text-sm">{opt.sub}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                ${selected === opt.id ? 'border-c-orange bg-c-orange' : 'border-c-border'}`}>
                {selected === opt.id && <Check size={12} className="text-white" />}
              </div>
            </button>
          ))}
        </div>

        {/* Phone input */}
        {requiresPhone && (
          <div className="mb-6">
            <label className="text-c-muted text-xs uppercase tracking-wide block mb-2">
              Numéro de téléphone (Cameroun)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="6XX XXX XXX"
              maxLength={9}
              className="input-field w-full text-base"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            <p className="text-c-muted text-xs mt-2 flex items-center gap-1.5">
              <Shield size={11} className="text-c-orange" />
              Vous recevrez une notification pour valider sur votre mobile.
            </p>
          </div>
        )}

        {/* Total */}
        <div className="card p-4 flex justify-between items-center mb-4">
          <span className="text-c-muted">Total</span>
          <span className="text-c-orange font-serif text-2xl font-bold">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Confirm CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-c-bg via-c-bg/95 to-transparent">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary w-full text-base disabled:opacity-60"
        >
          {loading ? 'Traitement...' : 'Confirmer le paiement'}
        </button>
      </div>
    </div>
  );
}
