import { useState, useEffect, useMemo, type FC } from 'react';
import { Gamepad2, Search, Plus, Pencil, Trash2, Upload, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Lightbulb, Package } from 'lucide-react';
import type { Game, GameSuggestion } from '@/types';
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
  const [view, setView] = useState<'catalog' | 'suggestions'>('catalog');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('games').select('*').order('name');
    if (error) setError(true);
    else setGames(data || []);
    setLoading(false);
  };

  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(false);
    const { data, error } = await supabase.from('game_suggestions').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
    if (error) setSuggestionsError(true);
    else setSuggestions(data || []);
    setSuggestionsLoading(false);
  };

  useEffect(() => { load(); loadSuggestions(); }, []);

  const deleteGame = async (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    await supabase.from('games').delete().eq('id', id);
  };

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.genre.toLowerCase().includes(search.toLowerCase())
  );

  // Group suggestions by normalized name for anti-duplication display
  const groupedSuggestions = useMemo(() => {
    const map = new Map<string, { game_name: string; count: number; items: GameSuggestion[] }>();
    suggestions.forEach((s) => {
      const key = s.game_name_normalized;
      if (!map.has(key)) {
        map.set(key, { game_name: s.game_name, count: 0, items: [] });
      }
      const entry = map.get(key)!;
      entry.count++;
      entry.items.push(s);
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      normalized: key,
      game_name: val.game_name,
      count: val.count,
      items: val.items,
    }));
  }, [suggestions]);

  const discardSuggestion = async (group: { items: GameSuggestion[] }) => {
    const ids = group.items.map((i) => i.id);
    setSuggestions((prev) => prev.filter((s) => !ids.includes(s.id)));
    await supabase.from('game_suggestions').update({ status: 'descartado' }).in('id', ids);
  };

  const acceptSuggestion = (group: { game_name: string; items: GameSuggestion[] }) => {
    // Open the game form pre-filled with the suggested name
    setEditing({ id: '', name: group.game_name, genre: '', year: null } as Game);
    setShowForm(true);
    // Mark suggestions as added after form save — handled in onSaved callback
    // We store the pending ids on the form via a closure
    (window as unknown as Record<string, unknown>).__pendingSuggestionIds = group.items.map((i) => i.id);
  };

  const onGameFormSaved = async () => {
    setShowForm(false);
    const pendingIds = (window as unknown as Record<string, unknown>).__pendingSuggestionIds as string[] | undefined;
    if (pendingIds && pendingIds.length > 0) {
      setSuggestions((prev) => prev.filter((s) => !pendingIds.includes(s.id)));
      await supabase.from('game_suggestions').update({ status: 'adicionado' }).in('id', pendingIds);
      delete (window as unknown as Record<string, unknown>).__pendingSuggestionIds;
    }
    load();
  };

  return (
    <div>
      {/* Sub-tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'catalog' ? 'bg-xbox-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
        >
          <Gamepad2 className="w-4 h-4" /> Catálogo
        </button>
        <button
          onClick={() => setView('suggestions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'suggestions' ? 'bg-xbox-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
        >
          <Lightbulb className="w-4 h-4" /> Sugestões
          {suggestions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-xbox-500/30 text-xbox-200 font-bold">{suggestions.length}</span>
          )}
        </button>
      </div>

      {view === 'catalog' && (
        <>
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

          {loading ? (
            <LoadingState text="Carregando jogos..." />
          ) : error ? (
            <ErrorState text="Erro ao carregar jogos." onRetry={load} />
          ) : filtered.length === 0 ? (
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
        </>
      )}

      {view === 'suggestions' && (
        <div>
          <div className="mb-4">
            <h3 className="text-sm text-neutral-400">
              {suggestionsLoading ? 'Carregando sugestões...' : `${groupedSuggestions.length} jogo(s) sugerido(s) pelos clientes`}
            </h3>
          </div>

          {suggestionsLoading ? (
            <LoadingState text="Carregando sugestões..." />
          ) : suggestionsError ? (
            <ErrorState text="Erro ao carregar sugestões." onRetry={loadSuggestions} />
          ) : groupedSuggestions.length === 0 ? (
            <EmptyState icon={Lightbulb} text="Nenhuma sugestão pendente no momento." />
          ) : (
            <div className="space-y-2">
              {groupedSuggestions.map((group) => (
                <div key={group.normalized} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{group.game_name}</p>
                    <p className="text-xs text-neutral-500">
                      {group.count > 1 ? (
                        <span className="text-xbox-400 font-semibold">Sugerido {group.count} vezes</span>
                      ) : (
                        group.items[0]?.suggested_by ? `Por ${group.items[0].suggested_by}` : 'Sugestão de cliente'
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => acceptSuggestion(group)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-xbox-500 text-white text-xs font-semibold hover:bg-xbox-400 transition-all active:scale-95"
                      title="Adicionar ao catálogo"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                    <button
                      onClick={() => discardSuggestion(group)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold border border-neutral-700 transition-all active:scale-95"
                      title="Descartar sugestão"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Descartar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && <GameForm game={editing} onClose={() => { setShowForm(false); delete (window as unknown as Record<string, unknown>).__pendingSuggestionIds; }} onSaved={onGameFormSaved} />}
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
    if (game?.id) {
      await supabase.from('games').update(payload).eq('id', game.id);
    } else {
      await supabase.from('games').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={game?.id ? 'Editar Jogo' : 'Novo Jogo'} onClose={onClose}>
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
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {game?.id ? 'Salvar' : 'Criar'}
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
