import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { useStore } from '../../store';
import { CATEGORIES } from '../../data/menu';
import { formatPrice } from '../../lib/utils';
import type { MenuItem } from '../../types';

const EMPTY: Omit<MenuItem, 'id'> = {
  name: '', description: '', price: 0, category: 'burgers',
  image: '', prepTime: 10, isTop: false, available: true,
};

export default function MenuManager() {
  const { menuItems, updateMenuItem, addMenuItem, deleteMenuItem } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>(EMPTY);
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((m) => m.category === activeCategory);

  const openEdit = (item: MenuItem) => { setEditing(item); setForm({ ...item }); setAdding(false); };
  const openAdd  = () => { setAdding(true); setEditing(null); setForm({ ...EMPTY }); };

  const handleSave = () => {
    if (editing) { updateMenuItem({ ...editing, ...form }); setEditing(null); }
    else { addMenuItem(form); setAdding(false); }
  };

  const handleDelete = (id: string) => {
    if (confirm === id) { deleteMenuItem(id); setConfirm(null); }
    else setConfirm(id);
  };

  const isFormValid = form.name && form.price > 0 && form.category;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Gestion du <span className="text-c-orange">menu</span></h1>
          <p className="text-c-muted text-sm mt-1">{menuItems.length} articles • {menuItems.filter((m) => m.available).length} disponibles</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-5 py-3 text-sm">
          <Plus size={16} /> Ajouter un article
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
        {[{ id: 'all', name: 'Tout', emoji: '🍽️' }, ...CATEGORIES].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0
              ${activeCategory === cat.id ? 'bg-c-orange text-white' : 'bg-c-card border border-c-border text-c-muted hover:text-white'}`}
          >
            <span>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className={`card overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
            <div className="relative h-40 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60'; }}
              />
              {item.isTop && (
                <span className="absolute top-2 left-2 bg-c-gold text-white text-xs font-bold px-2 py-1 rounded-full">⭐ TOP</span>
              )}
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">Indisponible</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                <span className="text-c-gold font-bold text-sm shrink-0 ml-2">{formatPrice(item.price)}</span>
              </div>
              <p className="text-c-muted text-xs line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateMenuItem({ ...item, available: !item.available })}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all
                    ${item.available ? 'border-c-border text-c-muted hover:text-white' : 'border-green-700/50 text-green-400 hover:bg-green-900/20'}`}
                >
                  {item.available ? <EyeOff size={12} /> : <Eye size={12} />}
                  {item.available ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-c-border text-c-muted hover:text-white hover:border-c-line transition-all"
                >
                  <Edit2 size={12} /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className={`ml-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all
                    ${confirm === item.id ? 'border-red-500 bg-red-900/30 text-red-400' : 'border-c-border text-c-muted hover:border-red-700/50 hover:text-red-400'}`}
                >
                  {confirm === item.id ? <><Check size={12} /> Confirmer</> : <><Trash2 size={12} /></>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setAdding(false); setEditing(null); }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-serif text-xl font-bold">{editing ? 'Modifier l\'article' : 'Nouvel article'}</h2>
              <button onClick={() => { setAdding(false); setEditing(null); }} className="text-c-muted hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <Field label="Nom" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field w-full" placeholder="Crave Classic" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field w-full resize-none" placeholder="Ingrédients, préparation…" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix (FCFA)" required>
                  <input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="input-field w-full" placeholder="4500" />
                </Field>
                <Field label="Temps (min)">
                  <input type="number" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: parseInt(e.target.value) || 0 })} className="input-field w-full" />
                </Field>
              </div>
              <Field label="Catégorie">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field w-full bg-c-card">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </Field>
              <Field label="URL Image">
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field w-full" placeholder="https://images.unsplash.com/…" />
              </Field>
              {form.image && (
                <img src={form.image} alt="" className="w-full h-36 object-cover rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isTop} onChange={(e) => setForm({ ...form, isTop: e.target.checked })} className="accent-c-orange w-4 h-4" />
                  <span className="text-c-muted text-sm">Badge TOP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="accent-c-orange w-4 h-4" />
                  <span className="text-c-muted text-sm">Disponible</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setAdding(false); setEditing(null); }} className="flex-1 border border-c-border text-c-muted py-3 rounded-xl hover:text-white transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={!isFormValid} className="flex-1 btn-primary disabled:opacity-50">
                {editing ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="text-c-muted text-xs uppercase tracking-wide block mb-1.5">
        {label}{required && <span className="text-c-orange ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
