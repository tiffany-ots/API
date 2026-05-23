import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Users, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { useStore } from '../../store';
import { formatPrice, formatDateShort } from '../../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending:   '#D4940A',
  preparing: '#E8612C',
  ready:     '#3B82F6',
  served:    '#22C55E',
  cancelled: '#EF4444',
};
const STATUS_LABELS: Record<string, string> = {
  pending:   'En attente',
  preparing: 'En préparation',
  ready:     'Prêt',
  served:    'Servi',
  cancelled: 'Annulé',
};

export default function Dashboard() {
  const { orders, settings } = useStore();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const todayOrders = useMemo(() =>
    orders.filter((o) => new Date(o.createdAt) >= today && o.status !== 'cancelled'),
    [orders, today]
  );

  const revenueToday = todayOrders.reduce((s, o) => s + o.total, 0);
  const avgTicket    = todayOrders.length ? Math.round(revenueToday / todayOrders.length) : 0;

  const revenue7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const rev = orders.filter((o) => {
        const c = new Date(o.createdAt);
        return c >= d && c < next && o.status !== 'cancelled';
      }).reduce((s, o) => s + o.total, 0);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      days.push({ day: label.charAt(0).toUpperCase() + label.slice(1), rev });
    }
    return days;
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({ name: STATUS_LABELS[status], value, fill: STATUS_COLORS[status] }));
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const activeTables = new Set(
    orders.filter((o) => o.status === 'preparing' || o.status === 'pending').map((o) => o.tableNumber)
  ).size;

  const KPI = [
    { label: 'Revenu aujourd\'hui', value: formatPrice(revenueToday), icon: TrendingUp, color: 'text-green-400', sub: `${todayOrders.length} commande${todayOrders.length > 1 ? 's' : ''}` },
    { label: 'Commandes aujourd\'hui', value: String(todayOrders.length), icon: ShoppingBag, color: 'text-c-orange', sub: 'total du jour' },
    { label: 'Ticket moyen', value: formatPrice(avgTicket), icon: DollarSign, color: 'text-c-gold', sub: 'par commande' },
    { label: 'Tables actives', value: String(activeTables), icon: Users, color: 'text-blue-400', sub: `sur ${settings.tableCount}` },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white">
          Tableau de <span className="text-c-orange">bord</span>
        </h1>
        <p className="text-c-muted text-sm mt-1">Mise à jour automatique en temps réel.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card p-5">
            <div className={`${color} mb-3`}><Icon size={22} /></div>
            <p className="text-white font-bold text-xl font-serif">{value}</p>
            <p className="text-c-muted text-xs mt-1">{label}</p>
            <p className="text-c-muted text-xs">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue bar chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-c-orange" /> Revenus — 7 derniers jours
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenue7} barSize={24}>
              <XAxis dataKey="day" tick={{ fill: '#9B7B6B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#2A1200', border: '1px solid #3D1E0A', borderRadius: 12, color: '#fff' }}
                formatter={(v: number) => [formatPrice(v), 'Revenus']}
                cursor={{ fill: 'rgba(232,97,44,0.08)' }}
              />
              <Bar dataKey="rev" radius={[6,6,0,0]}>
                {revenue7.map((_, i) => (
                  <Cell key={i} fill={i === 6 ? '#E8612C' : '#3D1E0A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Statuts commandes</h2>
          {statusCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {statusCounts.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#2A1200', border: '1px solid #3D1E0A', borderRadius: 12, color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#9B7B6B' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-c-muted text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = orders.filter((o) => o.status === key).length;
          return (
            <div key={key} className="card p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{count}</div>
              <div className="text-c-muted text-xs">{label}</div>
              <div className="w-8 h-1 rounded-full mt-2 mx-auto" style={{ background: STATUS_COLORS[key] }} />
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-c-border flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock size={16} className="text-c-orange" /> Dernières commandes
          </h2>
          <button
            onClick={() => window.location.href = '/admin/orders'}
            className="text-c-orange text-sm flex items-center gap-1 hover:text-c-light"
          >
            Voir tout <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-c-border">
                {['N° Commande', 'Table', 'Articles', 'Total', 'Paiement', 'Heure', 'Statut'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-c-muted text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-c-border/50 hover:bg-c-card/50 transition-colors">
                  <td className="px-4 py-3 text-c-orange font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3 text-white font-semibold">{o.tableNumber}</td>
                  <td className="px-4 py-3 text-c-muted">{o.items.reduce((s, c) => s + c.quantity, 0)}</td>
                  <td className="px-4 py-3 text-c-gold font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-c-muted capitalize">{o.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-c-muted">{formatDateShort(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recentOrders.length && (
            <div className="py-12 text-center text-c-muted">Aucune commande</div>
          )}
        </div>
      </div>
    </div>
  );
}
