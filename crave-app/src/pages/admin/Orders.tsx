import { useState, useMemo } from 'react';
import { Clock, Check, ChefHat, UtensilsCrossed, X, Eye, Search } from 'lucide-react';
import { useStore } from '../../store';
import { formatPrice, formatDateShort, timeAgo } from '../../lib/utils';
import type { Order, OrderStatus } from '../../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'En attente',    color: '#D4940A', bg: '#D4940A22', icon: Clock           },
  preparing: { label: 'En préparation', color: '#E8612C', bg: '#E8612C22', icon: ChefHat         },
  ready:     { label: 'Prêt',          color: '#3B82F6', bg: '#3B82F622', icon: Check            },
  served:    { label: 'Servi',         color: '#22C55E', bg: '#22C55E22', icon: UtensilsCrossed  },
  cancelled: { label: 'Annulé',        color: '#EF4444', bg: '#EF444422', icon: X               },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'served',
};

const NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  pending:   'Démarrer préparation',
  preparing: 'Marquer Prêt',
  ready:     'Marquer Servi',
};

export default function Orders() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filter !== 'all') list = list.filter((o) => o.status === filter);
    if (search) list = list.filter((o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      String(o.tableNumber).includes(search)
    );
    return list;
  }, [orders, filter, search]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const tabs: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all',       label: 'Toutes'        },
    { key: 'pending',   label: 'En attente'    },
    { key: 'preparing', label: 'En préparation'},
    { key: 'ready',     label: 'Prêtes'        },
    { key: 'served',    label: 'Servies'       },
    { key: 'cancelled', label: 'Annulées'      },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Gestion des <span className="text-c-orange">commandes</span></h1>
          <p className="text-c-muted text-sm mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-c-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° commande ou table…"
            className="input-field pl-9 py-2.5 text-sm w-56"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0
              ${filter === key ? 'bg-c-orange text-white' : 'bg-c-card border border-c-border text-c-muted hover:text-white'}`}
          >
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-c-border text-c-muted'}`}>
              {counts[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-c-muted">Aucune commande</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className="card p-4 flex flex-col gap-3">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-c-orange font-mono text-xs font-semibold">{order.id}</p>
                    <p className="text-white font-bold text-lg">Table {order.tableNumber}</p>
                    <p className="text-c-muted text-xs">{timeAgo(order.createdAt)} • {formatDateShort(order.createdAt)}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-c-deep rounded-xl p-3 space-y-1">
                  {order.items.map((ci) => (
                    <div key={ci.menuItem.id} className="flex justify-between text-xs">
                      <span className="text-c-muted">{ci.quantity}× {ci.menuItem.name}</span>
                      <span className="text-white">{formatPrice(ci.menuItem.price * ci.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-c-border pt-2 flex justify-between text-sm font-semibold mt-1">
                    <span className="text-c-muted">Total</span>
                    <span className="text-c-orange">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between text-xs text-c-muted">
                  <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  {order.phoneNumber && <span>{order.phoneNumber}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setSelected(order)}
                    className="flex-1 border border-c-border text-c-muted py-2 rounded-xl text-xs font-medium hover:text-white hover:border-c-line transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={13} /> Détails
                  </button>
                  {nextStatus && (
                    <button
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                      className="flex-1 bg-c-orange text-white py-2 rounded-xl text-xs font-semibold hover:bg-c-light transition-colors"
                    >
                      {NEXT_LABELS[order.status]}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'served' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="w-9 border border-red-900/50 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-c-orange font-mono font-semibold">{selected.id}</p>
                <h3 className="text-white font-serif text-2xl font-bold">Table {selected.tableNumber}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-c-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {selected.items.map((ci) => (
                <div key={ci.menuItem.id} className="flex items-center gap-3 bg-c-deep rounded-xl p-3">
                  <img src={ci.menuItem.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{ci.quantity}× {ci.menuItem.name}</p>
                    {ci.note && <p className="text-c-muted text-xs mt-0.5">{ci.note}</p>}
                  </div>
                  <p className="text-c-orange text-sm font-semibold">{formatPrice(ci.menuItem.price * ci.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-c-border mt-4 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-c-muted text-xs">Total</p><p className="text-c-orange font-bold text-lg">{formatPrice(selected.total)}</p></div>
              <div><p className="text-c-muted text-xs">Paiement</p><p className="text-white capitalize">{selected.paymentMethod.replace('_', ' ')}</p></div>
              <div><p className="text-c-muted text-xs">Statut</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
              </div>
              <div><p className="text-c-muted text-xs">Heure</p><p className="text-white">{formatDateShort(selected.createdAt)}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
