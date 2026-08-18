import { useState, useEffect, type FC } from 'react';
import { Library, Search, Plus, Trash2, Loader as Loader2, CircleCheck as CheckCircle2, Upload, CircleAlert as AlertCircle, Gamepad2 } from 'lucide-react';
import type { MasterLibraryEntry, Game } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, Modal, Field, inputClass } from './shared';

const LibraryTab: FC = () => {
  const [entries, setEntries] = useState<MasterLibraryEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const [libRes, gamesRes] = await Promise.all([
      supabase.from('master_library').select('*').order('game_name'),
      supabase.from('games').select('*').order('name'),
    ]);
    if (libRes.error || gamesRes.error) {
      setError(true);
    } else {
      setEntries(libRes.data || []);
      setGames(gamesRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await supabase.from('master_library').delete().eq('id', id);
  };

  const filtered = entries.filter((e) =>
    e.game_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState text="Carregando biblioteca..." />;
  if (error) return <ErrorState text="Erro ao carregar biblioteca." onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar na biblioteca..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-700 hover:text-white border border-neutral-700 transition-all active:scale-95">
            <Upload className="w-4 h-4" /> Importar JSON
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-xbox-500 text-white text-sm font-semibold hover:bg-xbox-400 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Adicionar Jogo
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
        <Library className="w-4 h-4 text-xbox-400" />
        <span>{entries.length} jogo(s) em estoque local</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Library} text={search ? 'Nenhum jogo encontrado na biblioteca.' : 'Biblioteca vazia. Adicione jogos que você já tem em estoque.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <CheckCircle2 className="w-4 h-4 text-xbox-400 shrink-0" />
                <p className="text-sm font-semibold text-white truncate">{entry.game_name}</p>
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && <AddGameForm games={games} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showImport && <ImportLibrary onClose={() => setShowImport(false)} onDone={() => { setShowImport(false); load(); }} />}
    </div>
  );
};

const AddGameForm: FC<{ games: Game[]; onClose: () => void; onSaved: () => void }> = ({ games, onClose, onSaved }) => {
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const name = mode === 'select' ? games.find((g) => g.id === selectedGameId)?.name : customName.trim();
    if (!name) {
      setError('Selecione um jogo do catálogo ou digite um nome.');
      return;
    }

    setSaving(true);
    const payload: { game_name: string; game_id: string | null } = {
      game_name: name,
      game_id: mode === 'select' ? selectedGameId : null,
    };

    const { error: insertError } = await supabase.from('master_library').insert(payload);
    setSaving(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Este jogo já está na biblioteca.');
      } else {
        setError(`Erro: ${insertError.message}`);
      }
      return;
    }
    onSaved();
  };

  return (
    <Modal title="Adicionar à Biblioteca Mestra" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('select')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'select' ? 'bg-xbox-500 text-white' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
            Do Catálogo
          </button>
          <button onClick={() => setMode('custom')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'custom' ? 'bg-xbox-500 text-white' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
            Nome Personalizado
          </button>
        </div>

        {mode === 'select' ? (
          <Field label="Selecionar jogo do catálogo">
            <select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)} className={inputClass}>
              <option value="">— Escolher jogo —</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Nome do jogo">
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ex: Halo 3" className={inputClass} />
          </Field>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <button onClick={save} disabled={saving || (mode === 'select' ? !selectedGameId : !customName.trim())}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Adicionar
        </button>
      </div>
    </Modal>
  );
};

const ImportLibrary: FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sampleJson = '["Halo 3", "Gears of War", "Forza Motorsport 4"]';

  const doImport = async () => {
    setError(null);
    setSuccess(null);
    if (!jsonText.trim()) {
      setError('Cole um JSON válido para importar.');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError('JSON inválido. Verifique a formatação.');
      return;
    }
    if (!Array.isArray(parsed)) {
      setError('O JSON deve ser um array de strings (nomes dos jogos).');
      return;
    }
    const names = (parsed as unknown[]).filter((n) => typeof n === 'string' && n.trim()) as string[];
    if (names.length === 0) {
      setError('Nenhum nome de jogo válido encontrado.');
      return;
    }
    const payload = names.map((n) => ({ game_name: n.trim() }));

    setImporting(true);
    const { error: insertError } = await supabase.from('master_library').insert(payload);
    setImporting(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Alguns jogos já estavam na biblioteca (duplicados ignorados).');
      } else {
        setError(`Erro ao importar: ${insertError.message}`);
      }
      return;
    }
    setSuccess(`${payload.length} jogo(s) adicionado(s) à biblioteca!`);
    setJsonText('');
    setTimeout(onDone, 1200);
  };

  return (
    <Modal title="Importar Jogos para Biblioteca" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-neutral-400">
          Cole abaixo um array JSON com os nomes dos jogos que você já tem em estoque local.
        </p>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={sampleJson}
          rows={10}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-xbox-500 transition-colors font-mono resize-none"
        />
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-xbox-500/10 border border-xbox-500/30 text-xbox-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{success}</span>
          </div>
        )}
        <button onClick={doImport} disabled={importing || !jsonText.trim()}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar</>}
        </button>
      </div>
    </Modal>
  );
};

export default LibraryTab;