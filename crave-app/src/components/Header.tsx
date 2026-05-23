import { ShoppingBag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface HeaderProps {
  tableId: string | undefined;
}

export default function Header({ tableId }: HeaderProps) {
  const navigate = useNavigate();
  const count = useStore((s) => s.getCartCount());
  const { settings } = useStore();

  return (
    <header className="sticky top-0 z-40 glass border-b border-c-border px-5 py-3 flex items-center justify-between">
      <button onClick={() => navigate(`/menu/${tableId}`)} className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-c-orange rounded-xl flex items-center justify-center shrink-0">
          <span className="text-lg">🍴</span>
        </div>
        <div className="leading-tight">
          <p className="text-c-orange font-serif font-semibold text-base leading-none">{settings.restaurantName}</p>
          <p className="text-c-muted text-xs mt-0.5">TABLE {tableId}</p>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/menu/${tableId}?account=true`)}
          className="w-10 h-10 bg-c-card border border-c-border rounded-full flex items-center justify-center text-c-muted hover:text-white transition-colors"
        >
          <User size={18} />
        </button>
        <button
          onClick={() => navigate(`/cart/${tableId}`)}
          className="w-10 h-10 bg-c-card border border-c-border rounded-full flex items-center justify-center text-c-muted hover:text-white transition-colors relative"
        >
          <ShoppingBag size={18} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-c-orange rounded-full text-white text-xs font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
