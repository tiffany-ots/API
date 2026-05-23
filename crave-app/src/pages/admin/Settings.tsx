import { useState } from 'react';
import { Save, Eye, EyeOff, Check } from 'lucide-react';
import { useStore } from '../../store';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ restaurantName: form.restaurantName, tableCount: form.tableCount, paymentMethods: form.paymentMethods });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePwd = () => {
    if (oldPwd !== settings.adminPassword) { setPwdError('Ancien mot de passe incorrect'); return; }
    if (newPwd.length < 4) { setPwdError('Le nouveau mot de passe doit avoir au moins 4 caractères'); return; }
    updateSettings({ adminPassword: newPwd });
    setOldPwd(''); setNewPwd(''); setPwdError('');
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-c-muted text-sm mt-1">Configuration générale du restaurant</p>
      </div>

      <div className="space-y-6">
        {/* Restaurant info */}
        <section className="card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">🍴 Informations du restaurant</h2>
          <div className="space-y-4">
            <div>
              <label className="text-c-muted text-xs uppercase tracking-wide block mb-1.5">Nom du restaurant</label>
              <input
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                className="input-field w-full"
                placeholder="Crave"
              />
            </div>
            <div>
              <label className="text-c-muted text-xs uppercase tracking-wide block mb-1.5">Nombre de tables</label>
              <input
                type="number"
                value={form.tableCount}
                onChange={(e) => setForm({ ...form, tableCount: parseInt(e.target.value) || 1 })}
                className="input-field w-32"
                min={1}
                max={99}
              />
              <p className="text-c-muted text-xs mt-1">Les numéros de table iront de 01 à {String(form.tableCount).padStart(2, '0')}</p>
            </div>
          </div>
        </section>

        {/* Payment methods */}
        <section className="card p-6">
          <h2 className="text-white font-semibold mb-4">💳 Modes de paiement</h2>
          <div className="space-y-3">
            {([
              { key: 'orange_money', label: 'Orange Money',  emoji: '📱', color: 'text-orange-400'  },
              { key: 'mtn_momo',    label: 'MTN MoMo',      emoji: '📱', color: 'text-yellow-400'  },
              { key: 'cash',        label: 'Espèces',       emoji: '💵', color: 'text-green-400'   },
            ] as const).map(({ key, label, emoji, color }) => (
              <label key={key} className="flex items-center justify-between p-4 bg-c-deep rounded-xl cursor-pointer hover:bg-c-hover transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <span className={`font-medium ${color}`}>{label}</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.paymentMethods[key]}
                    onChange={(e) => setForm({ ...form, paymentMethods: { ...form.paymentMethods, [key]: e.target.checked } })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${form.paymentMethods[key] ? 'bg-c-orange' : 'bg-c-border'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.paymentMethods[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Password change */}
        <section className="card p-6">
          <h2 className="text-white font-semibold mb-4">🔒 Changer le mot de passe admin</h2>
          <div className="space-y-3">
            <div>
              <label className="text-c-muted text-xs uppercase tracking-wide block mb-1.5">Ancien mot de passe</label>
              <div className="relative">
                <input
                  type={showOldPwd ? 'text' : 'password'}
                  value={oldPwd}
                  onChange={(e) => { setOldPwd(e.target.value); setPwdError(''); }}
                  className="input-field w-full pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowOldPwd((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-c-muted hover:text-white">
                  {showOldPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-c-muted text-xs uppercase tracking-wide block mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError(''); }}
                  className="input-field w-full pr-12"
                  placeholder="Minimum 4 caractères"
                />
                <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-c-muted hover:text-white">
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {pwdError && <p className="text-red-400 text-sm">{pwdError}</p>}
            <button onClick={handleChangePwd} className="btn-outline px-5 py-2.5 text-sm">
              Changer le mot de passe
            </button>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
            ${saved ? 'bg-green-600 text-white' : 'btn-primary'}`}
        >
          {saved ? <><Check size={16} /> Sauvegardé !</> : <><Save size={16} /> Sauvegarder les modifications</>}
        </button>
      </div>
    </div>
  );
}
