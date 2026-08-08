import { useState, useEffect, type FC } from 'react';
import { Package, Plus, Pencil, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import type { Accessory } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, Modal, Field, inputClass } from './shared';

const AccessoriesTab: FC = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Accessory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('accessories').select('*').order('name');
    if (error) setError(true);
    else setAccessories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteAccessory = async (id: string) => {
    setAccessories((prev) => prev.filter((a) => a.id !== id));
    await supabase.from('accessories').delete().eq('id', id);
  };

  if (loading) return <LoadingState text="Carregando acessórios..." />;
  if (error) return <ErrorState text="Erro ao carregar acessórios." onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm text-neutral-400">{accessories.length} acessório(s) cadastrado(s)</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-xbox-500 text-white text-sm font-semibold hover:bg-xbox-400 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Novo Acessório
        </button>
      </div>

      {accessories.length === 0 ? (
        <EmptyState icon={Package} text="Nenhum acessório cadastrado." />
      ) : (
        <div className="space-y-2">
          {accessories.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {acc.image_url ? (
                  <img src={acc.image_url} alt={acc.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-neutral-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{acc.name}</p>
                  <p className="text-sm text-xbox-400 font-bold">R$ {acc.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => { setEditing(acc); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteAccessory(acc.id)} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <AccessoryForm accessory={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
};

const AccessoryForm: FC<{ accessory: Accessory | null; onClose: () => void; onSaved: () => void }> = ({ accessory, onClose, onSaved }) => {
  const [name, setName] = useState(accessory?.name || '');
  const [price, setPrice] = useState(accessory?.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(accessory?.image_url || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !price.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), price: parseFloat(price), image_url: imageUrl.trim() || null };
    if (accessory) {
      await supabase.from('accessories').update(payload).eq('id', accessory.id);
    } else {
      await supabase.from('accessories').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={accessory ? 'Editar Acessório' : 'Novo Acessório'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome do Acessório">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Controle Sem Fio" className={inputClass} />
        </Field>
        <Field label="Preço (R$)">
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 89.90" className={inputClass} />
        </Field>
        <Field label="URL da Imagem (opcional)">
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={inputClass} />
        </Field>
        {imageUrl && (
          <div className="flex justify-center">
            <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-neutral-700" />
          </div>
        )}
        <button onClick={save} disabled={saving || !name.trim() || !price.trim()}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {accessory ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </Modal>
  );
};

export default AccessoriesTab;
