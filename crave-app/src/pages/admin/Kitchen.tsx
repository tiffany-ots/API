import { useState, useEffect } from 'react';
import { Flame, Check, Bell } from 'lucide-react';
import { useStore } from '../../store';
import { formatPrice, formatDateShort } from '../../lib/utils';
import type { OrderStatus } from '../../types';

export default function Kitchen() {
  const { orders, updateOrderStatus } = useStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  const active = orders.filter((o) => o.status === 'preparing' || o.status === 'pending' || o.status === 'ready');

  const statusNext: Partial<Record<OrderStatus, OrderStatus>> = {
    pending:   'preparing',
    preparing: 'ready',
    ready:     'served',
  };

  const statusLabel: Partial<Record<OrderStatus, string>> = {
    pending:   'Démarrer',
    preparing: 'Marquer Prêt',
    ready:     'Servi',
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            <Flame size={28} className="text-c-orange" /> Vue Cuisine
          </h1>
          <p className="text-c-muted text-sm mt-1">{active.length} commande{active.length !== 1 ? 's' : ''} active{active.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-c-muted text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          En direct
        </div>
      </div>

      {active.length === 0 ? (
        <div className="card p-16 text-center text-c-muted">
          <Check size={40} className="mx-auto mb-4 text-green-500/50" />
          <p className="text-lg font-semibold text-white">Cuisine libre !</p>
          <p className="text-sm mt-1">Aucune commande en attente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((order) => {
            const elapsed = Math.floor((now - new Date(order.createdAt).getTime()) / 60000);
            const isLate = elapsed > order.estimatedTime;
            return (
              <div key={order.id} className={`card p-5 border-2 ${isLate ? 'border-red-500/60 bg-red-900/10' : order.status === 'ready' ? 'border-blue-500/60' : 'border-c-orange/40'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className={`font-bold text-3xl font-serif ${isLate ? 'text-red-400' : 'text-white'}`}>
                      Table {order.tableNumber}
                    </p>
                    <p className="text-c-muted text-xs">{order.id} • {formatDateShort(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold font-serif ${isLate ? 'text-red-400' : 'text-c-gold'}`}>{elapsed}min</p>
                    <p className="text-c-muted text-xs">/ {order.estimatedTime}min</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1.5 bg-c-deep rounded-full mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isLate ? 'bg-red-500' : 'bg-c-orange'}`}
                    style={{ width: `${Math.min(100, (elapsed / order.estimatedTime) * 100)}%` }}
                  />
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((ci) => (
                    <div key={ci.menuItem.id} className="flex items-center gap-2 bg-c-deep rounded-lg px-3 py-2">
                      <span className="text-c-orange font-bold text-lg w-8 text-center">{ci.quantity}×</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{ci.menuItem.name}</p>
                        {ci.note && <p className="text-yellow-400 text-xs">{ci.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { const next = statusNext[order.status]; if (next) updateOrderStatus(order.id, next); }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                      ${order.status === 'ready' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'btn-primary'}`}
                  >
                    {statusLabel[order.status]}
                  </button>
                  {order.status === 'ready' && (
                    <button className="w-12 bg-c-gold/20 border border-c-gold/40 rounded-xl flex items-center justify-center text-c-gold hover:bg-c-gold/30 transition-colors">
                      <Bell size={18} />
                    </button>
                  )}
                </div>

                {isLate && (
                  <p className="text-red-400 text-xs text-center mt-2 font-semibold">⚠ Commande en retard !</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 card p-4 border-c-border/50">
        <p className="text-c-muted text-xs text-center">
          Total commandes terminées aujourd'hui : <span className="text-white font-semibold">{orders.filter((o) => o.status === 'served').length}</span>
          {' '}• Revenus : <span className="text-c-orange font-semibold">
            {formatPrice(orders.filter((o) => o.status === 'served').reduce((s, o) => s + o.total, 0))}
          </span>
        </p>
      </div>
    </div>
  );
}
