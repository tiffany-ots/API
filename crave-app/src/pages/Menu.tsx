import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { CATEGORIES } from '../data/menu';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

export default function Menu() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { menuItems, tableNumber, setTable } = useStore();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrolling = useRef(false);

  // Ensure table is set if coming from direct URL
  useEffect(() => {
    if (!tableNumber && tableId) setTable(parseInt(tableId, 10));
  }, [tableId, tableNumber, setTable]);

  const scrollToCategory = (catId: string) => {
    const el = sectionRefs.current[catId];
    if (!el) return;
    scrolling.current = true;
    setActiveCategory(catId);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrolling.current = false; }, 800);
  };

  // Highlight active category on scroll
  useEffect(() => {
    const onScroll = () => {
      if (scrolling.current) return;
      for (let i = CATEGORIES.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[CATEGORIES[i].id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) { setActiveCategory(CATEGORIES[i].id); return; }
        }
      }
      setActiveCategory(CATEGORIES[0].id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: menuItems.filter((m) => m.category === cat.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-c-bg">
      <Header tableId={tableId} />

      {/* Hero text */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-c-orange text-xs font-semibold tracking-widest uppercase mb-1">Notre carte</p>
        <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-2">
          Choisissez vos <span className="text-c-orange italic">envies</span>
        </h1>
        <p className="text-c-muted text-sm">Tout est préparé minute. Cliquez pour ajouter au panier.</p>
      </div>

      {/* Category chips */}
      <div className="sticky top-[65px] z-30 bg-c-bg/90 backdrop-blur-sm border-b border-c-border px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 whitespace-nowrap
              ${activeCategory === cat.id ? 'bg-c-orange text-white' : 'bg-c-card border border-c-border text-c-muted hover:text-white'}`}
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-8 pb-24">
        {grouped.map(({ cat, items }) => (
          <section key={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el as HTMLDivElement; }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-semibold text-white flex items-center gap-2">
                <span>{cat.emoji}</span> {cat.name}
              </h2>
              <span className="text-c-muted text-xs font-medium bg-c-card border border-c-border px-2.5 py-1 rounded-full">
                {items.length} plat{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-4">
              {items.map((item) => <ProductCard key={item.id} item={item} />)}
            </div>
          </section>
        ))}
      </div>

      {/* Sticky cart button (shows when cart has items) */}
      <CartBar tableId={tableId} navigate={navigate} />
    </div>
  );
}

function CartBar({ tableId, navigate }: { tableId: string | undefined; navigate: ReturnType<typeof useNavigate> }) {
  const count = useStore((s) => s.getCartCount());
  const total = useStore((s) => s.getCartTotal());
  if (!count) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-c-bg via-c-bg/95 to-transparent z-40">
      <button
        onClick={() => navigate(`/cart/${tableId}`)}
        className="btn-primary w-full flex items-center justify-between px-5 py-4"
      >
        <span className="bg-white/20 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">{count}</span>
        <span>Voir mon panier</span>
        <span className="font-semibold">{total.toLocaleString('fr-FR')} FCFA</span>
      </button>
    </div>
  );
}
