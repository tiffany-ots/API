import { useMemo, useState } from 'react';
import { QrCode, Users, X } from 'lucide-react';
import { useStore } from '../../store';
import { formatPrice } from '../../lib/utils';
import type { Order } from '../../types';

export default function Tables() {
  const { orders, settings } = useStore();
  const [selected, setSelected] = useState<number | null>(null);

  const tableStatus = useMemo(() => {
    const map: Record<number, Order | undefined> = {};
    for (let i = 1; i <= settings.tableCount; i++) {
      const active = orders.find(
        (o) => o.tableNumber === i && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
      );
      map[i] = active;
    }
    return map;
  }, [orders, settings.tableCount]);

  const occupied = Object.values(tableStatus).filter(Boolean).length;
  const selectedOrder = selected ? tableStatus[selected] : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white">Gestion des <span className="text-c-orange">tables</span></h1>
        <p className="text-c-muted text-sm mt-1">
          {occupied} / {settings.tableCount} tables occupées
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-c-card border border-c-border" /> Libre</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-c-orange/30 border border-c-orange/60" /> En commande</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-blue-500/30 border border-blue-400/60" /> Prêt à servir</div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-white font-bold text-2xl">{settings.tableCount - occupied}</p>
          <p className="text-c-muted text-xs mt-1">Tables libres</p>
        </div>
        <div className="card p-4 text-center border-c-orange/30">
          <p className="text-c-orange font-bold text-2xl">{occupied}</p>
          <p className="text-c-muted text-xs mt-1">Tables occupées</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-white font-bold text-2xl">
            {Object.values(tableStatus).filter((o) => o?.status === 'ready').length}
          </p>
          <p className="text-c-muted text-xs mt-1">Prêtes à servir</p>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: settings.tableCount }, (_, i) => i + 1).map((num) => {
          const order = tableStatus[num];
          const isReady = order?.status === 'ready';
          const isPreparing = order?.status === 'preparing' || order?.status === 'pending';
          return (
            <button
              key={num}
              onClick={() => setSelected(selected === num ? null : num)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all font-semibold text-lg relative
                ${isReady ? 'bg-blue-500/20 border-2 border-blue-400/60 text-blue-300 hover:border-blue-400'
                : isPreparing ? 'bg-c-orange/20 border-2 border-c-orange/60 text-c-orange hover:border-c-orange'
                : 'bg-c-card border border-c-border text-c-muted hover:border-c-line hover:text-white'}
                ${selected === num ? 'ring-2 ring-white/30' : ''}`}
            >
              <span>{String(num).padStart(2, '0')}</span>
              {order && (
                <span className={`w-2 h-2 rounded-full absolute top-2 right-2 ${isReady ? 'bg-blue-400' : 'bg-c-orange animate-pulse'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected table detail */}
      {selected && (
        <div className="mt-6 card p-5 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white font-serif text-xl font-bold flex items-center gap-2">
              <Users size={18} className="text-c-orange" />
              Table {String(selected).padStart(2, '0')}
            </h3>
            <button onClick={() => setSelected(null)} className="text-c-muted hover:text-white"><X size={18} /></button>
          </div>

          {selectedOrder ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-c-orange/20 text-c-orange border border-c-orange/30">
                  Commande active — {selectedOrder.id}
                </span>
                <span className="text-c-muted text-xs capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
              </div>
              {selectedOrder.items.map((ci) => (
                <div key={ci.menuItem.id} className="flex justify-between text-sm py-1.5 border-b border-c-border/50">
                  <span className="text-c-muted">{ci.quantity}× {ci.menuItem.name}</span>
                  <span className="text-white">{formatPrice(ci.menuItem.price * ci.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-semibold mt-3">
                <span className="text-c-muted">Total</span>
                <span className="text-c-orange font-serif text-xl">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-c-muted">
              <QrCode size={32} className="text-c-border" />
              <p className="text-sm">Table libre — Scannez pour afficher le QR code</p>
              <button
                className="btn-outline text-sm px-5 py-2.5"
                onClick={() => alert(`QR Code table ${selected}\nURL: ${window.location.origin}/menu/${selected}`)}
              >
                <QrCode size={14} className="inline mr-2" />
                Afficher le QR code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
