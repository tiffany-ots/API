import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useStore } from '../../store';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!password) { setError('Mot de passe requis'); return; }
    setLoading(true);
    setTimeout(() => {
      if (adminLogin(password)) {
        navigate('/admin/dashboard');
      } else {
        setError('Mot de passe incorrect');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: 'linear-gradient(135deg, #140800 0%, #1C0A00 50%, #2A1200 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-14 h-14 bg-c-orange rounded-2xl flex items-center justify-center shadow-lg shadow-c-orange/30">
          <span className="text-2xl">🍴</span>
        </div>
        <div>
          <p className="text-c-orange font-serif text-2xl font-bold">Crave</p>
          <p className="text-c-muted text-sm">Espace administrateur</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-c-orange" />
          <h1 className="text-white font-semibold text-lg">Connexion Admin</h1>
        </div>

        <div className="mb-4">
          <label className="text-c-muted text-xs uppercase tracking-wide block mb-2">Mot de passe</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="input-field w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-c-muted hover:text-white transition-colors"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-c-muted text-xs text-center mt-4">
          Mot de passe par défaut : <span className="text-c-orange font-mono">admin123</span>
        </p>
      </div>

      <button onClick={() => navigate('/')} className="mt-6 text-c-muted text-sm hover:text-white transition-colors">
        ← Retour à l'accueil
      </button>
    </div>
  );
}
