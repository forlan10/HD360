import { useState, useEffect, type FC } from 'react';
import { Library, Search, Plus, Trash2, Loader as Loader2, CircleCheck as CheckCircle2, Upload, CircleAlert as AlertCircle, Gamepad2, Pencil, Volume2, Subtitles, Wrench, X as XIcon } from 'lucide-react';
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
  const [editingEntry, setEditingEntry] = useState<MasterLibraryEntry | null>(null);

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

  const updateEntry = (updated: MasterLibraryEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
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
            <LibraryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} onEdit={() => setEditingEntry(entry)} />
          ))}
        </div>
      )}

      {showForm && <AddGameForm games={games} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showImport && <ImportLibrary onClose={() => setShowImport(false)} onDone={() => { setShowImport(false); load(); }} />}
      {editingEntry && (
        <EditGameForm entry={editingEntry} onClose={() => setEditingEntry(null)} onSaved={(updated) => { updateEntry(updated); setEditingEntry(null); }} />
      )}
    </div>
  );
};

// ===================== LIBRARY CARD =====================

const LibraryCard: FC<{ entry: MasterLibraryEntry; onDelete: () => void; onEdit: () => void }> = ({ entry, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  const hasDetails = !entry.is_working || entry.not_working_reason || entry.dubbed_pt || entry.subtitles_pt || entry.special_install;

  return (
    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {entry.is_working ? (
            <CheckCircle2 className="w-4 h-4 text-xbox-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{entry.game_name}</p>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {!entry.is_working && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md border font-semibold bg-red-500/10 text-red-400 border-red-500/30">
                  Não funciona
                </span>
              )}
              {entry.dubbed_pt && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md border font-semibold bg-blue-500/10 text-blue-400 border-blue-500/30">
                  <Volume2 className="w-2.5 h-2.5" /> Dublado
                </span>
              )}
              {entry.subtitles_pt && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md border font-semibold bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                  <Subtitles className="w-2.5 h-2.5" /> Legendas PT
                </span>
              )}
              {entry.special_install && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md border font-semibold bg-amber-500/10 text-amber-400 border-amber-500/30">
                  <Wrench className="w-2.5 h-2.5" /> Inst. especial
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasDetails && (
            <button onClick={() => setExpanded((p) => !p)} className="text-xs px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700 transition-all whitespace-nowrap">
              {expanded ? 'Ocultar' : 'Detalhes'}
            </button>
          )}
          <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-xbox-400 flex items-center justify-center transition-all shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in">
          {!entry.is_working && entry.not_working_reason && (
            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Motivo de não funcionar</p>
              <p className="text-xs text-neutral-300 whitespace-pre-wrap">{entry.not_working_reason}</p>
            </div>
          )}
          {entry.special_install && (
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Instalação especial</p>
              <p className="text-xs text-neutral-300 whitespace-pre-wrap">{entry.special_install}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ===================== ADD GAME FORM =====================

const AddGameForm: FC<{ games: Game[]; onClose: () => void; onSaved: () => void }> = ({ games, onClose, onSaved }) => {
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [customName, setCustomName] = useState('');
  const [isWorking, setIsWorking] = useState(true);
  const [notWorkingReason, setNotWorkingReason] = useState('');
  const [dubbedPt, setDubbedPt] = useState(false);
  const [subtitlesPt, setSubtitlesPt] = useState(false);
  const [specialInstall, setSpecialInstall] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const name = mode === 'select' ? games.find((g) => g.id === selectedGameId)?.name : customName.trim();
    if (!name) {
      setError('Selecione um jogo do catálogo ou digite um nome.');
      return;
    }
    if (!isWorking && !notWorkingReason.trim()) {
      setError('Informe o motivo de o jogo não funcionar.');
      return;
    }

    setSaving(true);
    const payload = {
      game_name: name,
      game_id: mode === 'select' ? selectedGameId : null,
      is_working: isWorking,
      not_working_reason: !isWorking ? notWorkingReason.trim() : null,
      dubbed_pt: dubbedPt,
      subtitles_pt: subtitlesPt,
      special_install: specialInstall.trim() || null,
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

        <SpecFields
          isWorking={isWorking} setIsWorking={setIsWorking}
          notWorkingReason={notWorkingReason} setNotWorkingReason={setNotWorkingReason}
          dubbedPt={dubbedPt} setDubbedPt={setDubbedPt}
          subtitlesPt={subtitlesPt} setSubtitlesPt={setSubtitlesPt}
          specialInstall={specialInstall} setSpecialInstall={setSpecialInstall}
        />

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

// ===================== EDIT GAME FORM =====================

const EditGameForm: FC<{ entry: MasterLibraryEntry; onClose: () => void; onSaved: (updated: MasterLibraryEntry) => void }> = ({ entry, onClose, onSaved }) => {
  const [isWorking, setIsWorking] = useState(entry.is_working);
  const [notWorkingReason, setNotWorkingReason] = useState(entry.not_working_reason ?? '');
  const [dubbedPt, setDubbedPt] = useState(entry.dubbed_pt);
  const [subtitlesPt, setSubtitlesPt] = useState(entry.subtitles_pt);
  const [specialInstall, setSpecialInstall] = useState(entry.special_install ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    if (!isWorking && !notWorkingReason.trim()) {
      setError('Informe o motivo de o jogo não funcionar.');
      return;
    }

    setSaving(true);
    const updates = {
      is_working: isWorking,
      not_working_reason: !isWorking ? notWorkingReason.trim() : null,
      dubbed_pt: dubbedPt,
      subtitles_pt: subtitlesPt,
      special_install: specialInstall.trim() || null,
    };

    const { data, error: updateError } = await supabase
      .from('master_library')
      .update(updates)
      .eq('id', entry.id)
      .select('*')
      .single();

    setSaving(false);

    if (updateError || !data) {
      setError(`Erro: ${updateError?.message ?? 'desconhecido'}`);
      return;
    }
    onSaved(data as MasterLibraryEntry);
  };

  return (
    <Modal title={`Editar — ${entry.game_name}`} onClose={onClose}>
      <div className="space-y-4">
        <SpecFields
          isWorking={isWorking} setIsWorking={setIsWorking}
          notWorkingReason={notWorkingReason} setNotWorkingReason={setNotWorkingReason}
          dubbedPt={dubbedPt} setDubbedPt={setDubbedPt}
          subtitlesPt={subtitlesPt} setSubtitlesPt={setSubtitlesPt}
          specialInstall={specialInstall} setSpecialInstall={setSpecialInstall}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <button onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Salvar Alterações
        </button>
      </div>
    </Modal>
  );
};

// ===================== SHARED SPEC FIELDS =====================

const ToggleRow: FC<{ label: string; icon: React.ReactNode; value: boolean; onChange: (v: boolean) => void }> = ({ label, icon, value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`flex items-center justify-between gap-3 w-full p-3 rounded-xl border-2 transition-all ${value ? 'border-xbox-500 bg-xbox-500/10' : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'}`}
  >
    <span className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
      {icon} {label}
    </span>
    <span className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-xbox-500' : 'bg-neutral-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

const SpecFields: FC<{
  isWorking: boolean; setIsWorking: (v: boolean) => void;
  notWorkingReason: string; setNotWorkingReason: (v: string) => void;
  dubbedPt: boolean; setDubbedPt: (v: boolean) => void;
  subtitlesPt: boolean; setSubtitlesPt: (v: boolean) => void;
  specialInstall: string; setSpecialInstall: (v: string) => void;
}> = ({ isWorking, setIsWorking, notWorkingReason, setNotWorkingReason, dubbedPt, setDubbedPt, subtitlesPt, setSubtitlesPt, specialInstall, setSpecialInstall }) => (
  <>
    <div className="pt-2 border-t border-neutral-800">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Especificações</p>
      <div className="space-y-2.5">
        <ToggleRow
          label="Funciona"
          icon={<CheckCircle2 className={`w-4 h-4 ${isWorking ? 'text-xbox-400' : 'text-neutral-500'}`} />}
          value={isWorking}
          onChange={setIsWorking}
        />
        {!isWorking && (
          <Field label="Motivo / restrição (obrigatório)">
            <textarea
              value={notWorkingReason}
              onChange={(e) => setNotWorkingReason(e.target.value)}
              placeholder="Ex: trava na tela inicial, áudio com glitch, etc."
              rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors resize-none"
            />
          </Field>
        )}
        <ToggleRow
          label="Dublado em Português"
          icon={<Volume2 className={`w-4 h-4 ${dubbedPt ? 'text-blue-400' : 'text-neutral-500'}`} />}
          value={dubbedPt}
          onChange={setDubbedPt}
        />
        <ToggleRow
          label="Legendas em Português"
          icon={<Subtitles className={`w-4 h-4 ${subtitlesPt ? 'text-cyan-400' : 'text-neutral-500'}`} />}
          value={subtitlesPt}
          onChange={setSubtitlesPt}
        />
        <Field label="Instalação especial / observações">
          <textarea
            value={specialInstall}
            onChange={(e) => setSpecialInstall(e.target.value)}
            placeholder="Ex: precisa atualização TU4, copiar pasta X antes de instalar, etc."
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors resize-none"
          />
        </Field>
      </div>
    </div>
  </>
);

// ===================== IMPORT LIBRARY =====================

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
