import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight, Settings } from 'lucide-react';
import { useStore } from '../store';

export default function Landing() {
  const [tableInput, setTableInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setTable, settings } = useStore();

  const handleEnter = () => {
    const num = parseInt(tableInput, 10);
    if (!tableInput || isNaN(num)) { setError('Veuillez saisir un numéro de table'); return; }
    if (num < 1 || num > settings.tableCount) {
      setError(`Table invalide. Tables 01 à ${String(settings.tableCount).padStart(2, '0')}`);
      return;
    }
    setTable(num);
    navigate(`/menu/${num}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(20,5,0,0.72) 0%, rgba(20,5,0,0.5) 40%, rgba(20,5,0,0.88) 100%), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Admin shortcut */}
      <button
        onClick={() => navigate('/admin/login')}
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-c-muted hover:text-white transition-colors"
        title="Admin"
      >
        <Settings size={18} />
      </button>

      {/* Logo */}
      <div className="pt-14 px-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-c-orange rounded-2xl flex items-center justify-center">
            <span className="text-xl">🍴</span>
          </div>
          <span className="text-c-orange font-serif text-2xl font-semibold">{settings.restaurantName}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-7 pt-10 pb-6">
        <p className="text-c-orange text-xs font-semibold tracking-widest uppercase mb-3">Bienvenue</p>
        <h1 className="font-serif text-5xl font-bold text-white leading-tight mb-5">
          Régalez-vous,{' '}
          <span className="text-c-orange italic">à votre table.</span>
        </h1>
        <p className="text-gray-300 text-base leading-relaxed mb-10">
          Scannez le QR code de votre table ou saisissez son numéro pour ouvrir le menu.
        </p>

        {/* QR Scanner */}
        <button
          onClick={() => alert('Fonctionnalité QR disponible sur mobile.\nPointez votre caméra vers le QR code de la table.')}
          className="flex items-center gap-4 bg-c-card/80 border border-c-border rounded-2xl p-4 mb-6 w-full text-left hover:bg-c-hover transition-colors active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-c-orange rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-base">Scanner le QR code</p>
            <p className="text-c-muted text-sm">Détection automatique de votre table</p>
          </div>
          <ArrowRight className="w-5 h-5 text-c-muted" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-c-border" />
          <span className="text-c-muted text-sm">OU</span>
          <div className="flex-1 h-px bg-c-border" />
        </div>

        {/* Table input */}
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={tableInput}
            onChange={(e) => { setTableInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            placeholder={`N° de table (01–${String(settings.tableCount).padStart(2, '0')})`}
            className="flex-1 input-field text-base"
            min={1}
            max={settings.tableCount}
          />
          <button onClick={handleEnter} className="btn-primary px-6 py-4 rounded-2xl whitespace-nowrap bg-c-gold hover:bg-c-orange">
            Entrer
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        <p className="text-c-muted text-xs mt-1">
          Tables disponibles : 01 à {String(settings.tableCount).padStart(2, '0')}.
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-c-muted text-xs pb-10 px-7">
        Une expérience {settings.restaurantName} • Service à table en quelques secondes
      </p>
    </div>
  );
}
