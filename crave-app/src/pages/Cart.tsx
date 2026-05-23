import { useState } from 'react';
import { ArrowLeft, Trash2, Minus, Plus, FileText, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import Header from '../components/Header';
import { formatPrice } from '../lib/utils';

export default function Cart() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, updateNote, getCartTotal, getEstimatedTime } = useStore();
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  const total = getCartTotal();
  const estTime = getEstimatedTime();

  const handleSaveNote = (itemId: string) => {
    updateNote(itemId, noteValue);
    setOpenNote(null);
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-c-bg">
        <Header tableId={tableId} />
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
          <span className="text-5xl mb-4">🛒</span>
          <h2 className="font-serif text-2xl text-white mb-2">Votre panier est vide</h2>
          <p className="text-c-muted mb-8">Explorez notre carte pour ajouter des plats</p>
          <button onClick={() => navigate(`/menu/${tableId}`)} className="btn-primary px-8">Voir le menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-c-bg pb-32">
      <Header tableId={tableId} />

      <div className="px-5 pt-5">
        <button onClick={() => navigate(`/menu/${tableId}`)} className="flex items-center gap-2 text-c-muted hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Retour au menu
        </button>

        <h1 className="font-serif text-4xl font-bold text-white mb-1">
          Votre <span className="text-c-orange italic">commande</span>
        </h1>
        <p className="text-c-muted text-sm mb-6">
          Service à la <span className="text-c-gold font-semibold">table {tableId}</span>
        </p>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {cart.map((ci) => (
            <div key={ci.menuItem.id} className="card p-4">
              <div className="flex gap-3">
                <img
                  src={ci.menuItem.image}
                  alt={ci.menuItem.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=60'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white truncate pr-2">{ci.menuItem.name}</h3>
                    <button onClick={() => removeFromCart(ci.menuItem.id)} className="text-c-muted hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-c-orange font-semibold text-sm mt-0.5">{formatPrice(ci.menuItem.price)}</p>

                  {/* Note */}
                  {openNote === ci.menuItem.id ? (
                    <div className="mt-2">
                      <input
                        autoFocus
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Ex: sans oignons..."
                        className="w-full bg-c-deep border border-c-border rounded-xl px-3 py-2 text-white text-xs placeholder-c-muted focus:outline-none focus:border-c-orange"
                      />
                      <button onClick={() => handleSaveNote(ci.menuItem.id)} className="text-c-orange text-xs mt-1 font-medium">Enregistrer</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setOpenNote(ci.menuItem.id); setNoteValue(ci.note); }}
                      className="flex items-center gap-1 text-c-muted hover:text-white text-xs mt-2 transition-colors"
                    >
                      <FileText size={12} />
                      {ci.note ? ci.note : 'Ajouter une note'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  onClick={() => updateQuantity(ci.menuItem.id, -1)}
                  className="w-8 h-8 rounded-full border border-c-border text-c-muted flex items-center justify-center hover:border-c-orange hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-bold w-6 text-center">{ci.quantity}</span>
                <button
                  onClick={() => updateQuantity(ci.menuItem.id, 1)}
                  className="w-8 h-8 rounded-full bg-c-orange text-white flex items-center justify-center hover:bg-c-light transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated time */}
        <div className="card p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-c-orange/20 flex items-center justify-center text-c-orange">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-c-muted text-xs uppercase tracking-wide">Préparation estimée</p>
            <p className="text-white font-serif text-xl font-bold">~ {estTime} minutes</p>
            <p className="text-c-muted text-xs mt-0.5">
              Votre commande sera apportée à la <span className="text-c-gold">table {tableId}</span> dès qu'elle est prête.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-4 mb-4">
          <div className="flex justify-between text-c-muted text-sm mb-2">
            <span>Sous-total ({cart.reduce((s, c) => s + c.quantity, 0)} article{cart.reduce((s, c) => s + c.quantity, 0) > 1 ? 's' : ''})</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-c-muted text-sm mb-3">
            <span>Service</span>
            <span className="text-green-400">Inclus</span>
          </div>
          <div className="border-t border-c-border pt-3 flex justify-between">
            <span className="text-white font-semibold">Total à payer</span>
            <span className="text-c-orange font-serif text-2xl font-bold">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-c-bg via-c-bg/95 to-transparent">
        <button onClick={() => navigate(`/payment/${tableId}`)} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
          Procéder au paiement <ArrowLeft size={16} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
