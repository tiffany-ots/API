import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Users, ArrowUpRight } from 'lucide-react';
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

function BarChart({ data }: { data: { day: string; rev: number }[] }) {
  const max = Math.max(...data.map((d) => d.rev), 1);
  const W = 400, H = 160, pad = 28, barW = 28, gap = (W - pad * 2 - barW * data.length) / (data.length - 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {data.map((d, i) => {
        const bh = Math.max(4, ((d.rev / max) * (H - 40)));
        const x  = pad + i * (barW + gap);
        const y  = H - 20 - bh;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={5} fill={isLast ? '#E8612C' : '#3D1E0A'} />
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fill="#9B7B6B" fontSize={11}>{d.day}</text>
            {isLast && d.rev > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#E8612C" fontSize={10}>{formatPrice(d.rev)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-40 text-c-muted text-sm">Aucune donnée</div>;
  const R = 60, r = 38, cx = 90, cy = 80;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const xi1 = cx + r * Math.cos(angle - sweep), yi1 = cy + r * Math.sin(angle - sweep);
    const xi2 = cx + r * Math.cos(angle), yi2 = cy + r * Math.sin(angle);
    return { ...d, d: `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${xi2},${yi2} A${r},${r},0,${large},0,${xi1},${yi1} Z` };
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 180 160" style={{ width: 130, height: 120, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.fill} />)}
      </svg>
      <ul className="space-y-1.5 text-xs min-w-0">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5 text-c-muted">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} />
            <span className="truncate">{s.name} <span className="text-white">{s.value}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white">
          Tableau de <span className="text-c-orange">bord</span>
        </h1>
        <p className="text-c-muted text-sm mt-1">Mise à jour automatique en temps réel.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-c-orange" /> Revenus — 7 derniers jours
          </h2>
          <BarChart data={revenue7} />
        </div>
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Statuts commandes</h2>
          <DonutChart data={statusCounts} />
        </div>
      </div>

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

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-c-border flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock size={16} className="text-c-orange" /> Dernières commandes
          </h2>
          <button
            onClick={() => window.location.href = '#/admin/orders'}
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
