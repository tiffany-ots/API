import { useState } from 'react';
import { Clock, Plus, Star } from 'lucide-react';
import type { MenuItem } from '../types';
import { useStore } from '../store';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  item: MenuItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useStore((s) => s.addToCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      className="card overflow-hidden cursor-pointer animate-fade-in"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '58%' }}>
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=60'; }}
        />
        {/* Badges */}
        {item.isTop && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-c-gold text-white text-xs font-bold px-3 py-1 rounded-full">
            <Star size={10} fill="white" />
            TOP
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Clock size={11} />
          {item.prepTime} min
        </div>
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/40 px-4 py-2 rounded-full">Indisponible</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif font-semibold text-white text-lg leading-tight">{item.name}</h3>
          <span className="text-c-gold font-semibold text-base shrink-0 whitespace-nowrap">{formatPrice(item.price)}</span>
        </div>
        <p className={`text-c-muted text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {item.description}
        </p>

        {/* Add button */}
        {item.available && (
          <button
            onClick={handleAdd}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95
              ${added ? 'bg-green-600 text-white' : 'bg-c-orange hover:bg-c-light text-white'}`}
          >
            <Plus size={16} />
            {added ? 'Ajouté !' : 'Ajouter au panier'}
          </button>
        )}
      </div>
    </div>
  );
}
