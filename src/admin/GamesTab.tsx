import { useState, useEffect, type FC } from 'react';
import { Gamepad2, Search, Plus, Pencil, Trash2, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Game } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, Modal, Field, inputClass } from './shared';

const GamesTab: FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Game | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('games').select('*').order('name');
    if (error) setError(true);
    else setGames(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteGame = async (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    await supabase.from('games').delete().eq('id', id);
  };

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.genre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState text="Carregando jogos..." />;
  if (error) return <ErrorState text="Erro ao carregar jogos." onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jogo..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-700 hover:text-white border border-neutral-700 transition-all active:scale-95">
            <Upload className="w-4 h-4" /> Importar JSON
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-xbox-500 text-white text-sm font-semibold hover:bg-xbox-400 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Novo Jogo
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Gamepad2} text={search ? 'Nenhum jogo encontrado.' : 'Nenhum jogo cadastrado.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((game) => (
            <div key={game.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                <p className="text-xs text-neutral-500">{game.genre}{game.year ? ` • ${game.year}` : ''}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => { setEditing(game); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteGame(game.id)} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <GameForm game={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showImport && <ImportJson onClose={() => setShowImport(false)} onDone={() => { setShowImport(false); load(); }} />}
    </div>
  );
};

// ===================== GAME FORM =====================
const GameForm: FC<{ game: Game | null; onClose: () => void; onSaved: () => void }> = ({ game, onClose, onSaved }) => {
  const [name, setName] = useState(game?.name || '');
  const [genre, setGenre] = useState(game?.genre || '');
  const [year, setYear] = useState(game?.year?.toString() || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !genre.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), genre: genre.trim(), year: year ? parseInt(year) : null };
    if (game) {
      await supabase.from('games').update(payload).eq('id', game.id);
    } else {
      await supabase.from('games').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={game ? 'Editar Jogo' : 'Novo Jogo'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome do Jogo">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Halo 3" className={inputClass} />
        </Field>
        <Field label="Gênero">
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Ex: Tiro / FPS" className={inputClass} />
        </Field>
        <Field label="Ano (opcional)">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Ex: 2007" className={inputClass} />
        </Field>
        <button onClick={save} disabled={saving || !name.trim() || !genre.trim()}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {game ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </Modal>
  );
};

// ===================== IMPORT JSON =====================
const ImportJson: FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sampleJson = '[\n  { "name": "Halo 3", "genre": "Tiro / FPS", "year": 2007 },\n  { "name": "Gears of War", "genre": "Ação / Tiro", "year": 2006 }\n]';

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
      setError('O JSON deve ser um array de objetos.');
      return;
    }
    const rows = parsed as Record<string, unknown>[];
    const valid = rows.filter((r) => r && typeof r.name === 'string' && typeof r.genre === 'string');
    if (valid.length === 0) {
      setError('Nenhum jogo válido encontrado. Cada objeto deve ter pelo menos "name" e "genre".');
      return;
    }
    const payload = valid.map((r) => ({
      name: String(r.name).trim(),
      genre: String(r.genre).trim(),
      year: typeof r.year === 'number' ? r.year : null,
    }));

    setImporting(true);
    const { error } = await supabase.from('games').insert(payload);
    setImporting(false);

    if (error) {
      setError(`Erro ao importar: ${error.message}`);
    } else {
      setSuccess(`${payload.length} jogo(s) importado(s) com sucesso!`);
      setJsonText('');
      setTimeout(onDone, 1200);
    }
  };

  return (
    <Modal title="Importar Jogos via JSON" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-neutral-400">
          Cole abaixo um array JSON com os jogos. Cada objeto deve ter <code className="text-xbox-400">name</code> e <code className="text-xbox-400">genre</code> (obrigatórios) e <code className="text-xbox-400">year</code> (opcional).
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
          {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar Jogos</>}
        </button>
      </div>
    </Modal>
  );
};

export default GamesTab;
