import { useState, useMemo, type FC } from 'react';
import { Search, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Send, Gamepad2, HardDrive, CheckCircle2, User, Phone, MapPin, X, ShoppingBag } from 'lucide-react';
import type { Game, ConsoleModel, ConsoleStatus } from '@/types';
import { GAMES } from '@/data/games';

type Step = 1 | 2;

const WHATSAPP_NUMBER = '5511999999999';

const CONSOLE_MODELS: { value: ConsoleModel; label: string; desc: string }[] = [
  { value: 'Fat', label: 'Fat', desc: 'Modelo original' },
  { value: 'Slim', label: 'Slim', desc: 'Modelo intermediário' },
  { value: 'Super Slim', label: 'Super Slim', desc: 'Modelo compacto' },
];

const CONSOLE_STATUS: { value: ConsoleStatus; label: string; desc: string }[] = [
  { value: 'desbloqueado', label: 'Já é desbloqueado', desc: 'RGH / JTAG' },
  { value: 'bloqueado', label: 'Ainda é original', desc: 'Precisa desbloquear' },
];

const App: FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [model, setModel] = useState<ConsoleModel | null>(null);
  const [status, setStatus] = useState<ConsoleStatus | null>(null);
  const [search, setSearch] = useState('');
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GAMES;
    return GAMES.filter((g) => g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
  }, [search]);

  const addGame = (game: Game) => {
    setSelectedGames((prev) => (prev.some((g) => g.id === game.id) ? prev : [...prev, game]));
  };

  const removeGame = (id: string) => {
    setSelectedGames((prev) => prev.filter((g) => g.id !== id));
  };

  const clearAll = () => setSelectedGames([]);

  const canAdvance = model !== null && status !== null && selectedGames.length > 0;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const sendOrder = () => {
    if (!name.trim() || !phone.trim() || !neighborhood.trim() || !model || !status) return;

    const gameList = selectedGames.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
    const statusText = status === 'desbloqueado' ? 'Já desbloqueado (RGH/JTAG)' : 'Ainda original (precisa desbloquear)';

    const message =
      `*NOVO PEDIDO - HD XBOX 360*\n` +
      `---------------------------\n` +
      `*Console:* ${model}\n` +
      `*Status:* ${statusText}\n` +
      `---------------------------\n` +
      `*Jogos (${selectedGames.length}):*\n${gameList}\n` +
      `---------------------------\n` +
      `*Cliente:* ${name}\n` +
      `*WhatsApp:* ${phone}\n` +
      `*Bairro:* ${neighborhood}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const goBack = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radar] relative">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,124,16,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,124,16,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Top glow */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-xbox-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-32 sm:pb-12">
        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-xbox-500/10 border border-xbox-500/30 mb-3">
            <Gamepad2 className="w-4 h-4 text-xbox-400" />
            <span className="text-xs font-semibold text-xbox-400 uppercase tracking-wider">Xbox 360</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-glow leading-tight">
            Monte seu HD de Xbox 360
          </h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">
            Escolha seu console, selecione os jogos e finalize o pedido pelo WhatsApp.
          </p>
        </header>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step === 1 ? 'bg-xbox-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-white/20' : 'bg-xbox-500 text-white'}`}>1</span>
              Montar HD
            </div>
            <div className={`w-6 h-px ${step >= 2 ? 'bg-xbox-500' : 'bg-neutral-700'}`} />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step === 2 ? 'bg-xbox-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-white/20' : 'bg-neutral-600 text-neutral-300'}`}>2</span>
              Finalizar
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            {/* Console data */}
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-5 h-5 text-xbox-400" />
                <h2 className="text-lg font-bold text-white">Dados do Console</h2>
              </div>

              {/* Model */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Modelo do Xbox 360</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONSOLE_MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
                        model === m.value
                          ? 'border-xbox-500 bg-xbox-500/15 text-white'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-sm font-bold">{m.label}</span>
                      <span className="text-[10px] opacity-70">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Status do Console</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONSOLE_STATUS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all text-left ${
                        status === s.value
                          ? 'border-xbox-500 bg-xbox-500/15 text-white'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${status === s.value ? 'text-xbox-400' : 'text-neutral-600'}`} />
                      <div>
                        <span className="block text-sm font-semibold">{s.label}</span>
                        <span className="block text-[11px] opacity-70">{s.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Game catalog */}
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-xbox-400" />
                <h2 className="text-lg font-bold text-white">Catálogo de Jogos</h2>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar jogo por nome ou gênero..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Game list */}
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {filteredGames.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    Nenhum jogo encontrado para "{search}"
                  </div>
                ) : (
                  filteredGames.map((game) => {
                    const isSelected = selectedGames.some((g) => g.id === game.id);
                    return (
                      <div
                        key={game.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-xbox-500/40 bg-xbox-500/5'
                            : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                          <p className="text-xs text-neutral-500">{game.genre} • {game.year}</p>
                        </div>
                        <button
                          onClick={() => addGame(game)}
                          disabled={isSelected}
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-xbox-500/20 text-xbox-400 cursor-default'
                              : 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-95'
                          }`}
                        >
                          {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Selected games (cart) */}
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-xbox-400" />
                  <h2 className="text-lg font-bold text-white">Meus Jogos</h2>
                </div>
                {selectedGames.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              {selectedGames.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  Nenhum jogo selecionado ainda.
                  <br />
                  Use a busca acima e adicione seus favoritos.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedGames.map((game, index) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 animate-fade-in"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-xbox-500/20 text-xbox-400 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                          <p className="text-xs text-neutral-500">{game.genre}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeGame(game.id)}
                        className="shrink-0 w-9 h-9 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Total de jogos</span>
                <span className="text-2xl font-bold text-xbox-400 font-heading">{selectedGames.length}</span>
              </div>
            </section>

            {/* Advance button */}
            <button
              onClick={() => canAdvance && setStep(2)}
              disabled={!canAdvance}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all ${
                canAdvance
                  ? 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] animate-pulse-glow'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              Avançar para Finalizar
              <ArrowRight className="w-5 h-5" />
            </button>
            {!canAdvance && (
              <p className="text-center text-xs text-neutral-500">
                Selecione o modelo, o status e pelo menos 1 jogo para continuar
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            {/* Order summary */}
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-xbox-400" />
                Resumo do Pedido
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Modelo</span>
                  <span className="text-sm font-semibold text-white">{model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Status</span>
                  <span className="text-sm font-semibold text-white text-right">
                    {status === 'desbloqueado' ? 'Desbloqueado (RGH/JTAG)' : 'Original (bloqueado)'}
                  </span>
                </div>
                <div className="py-2">
                  <span className="text-sm text-neutral-400 block mb-2">Jogos ({selectedGames.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGames.map((g) => (
                      <span key={g.id} className="text-xs px-2 py-1 rounded-md bg-xbox-500/15 text-xbox-300 border border-xbox-500/20">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact form */}
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4">Seus Dados</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bairro</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Digite seu bairro"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={sendOrder}
                disabled={!name.trim() || !phone.trim() || !neighborhood.trim()}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all ${
                  name.trim() && phone.trim() && neighborhood.trim()
                    ? 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] animate-pulse-glow'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                Enviar meu Pedido
              </button>

              <button
                onClick={goBack}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar e editar jogos
              </button>
            </div>

            {!name.trim() || !phone.trim() || !neighborhood.trim() ? (
              <p className="text-center text-xs text-neutral-500">
                Preencha todos os campos para enviar o pedido
              </p>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 pb-4">
          <p className="text-xs text-neutral-600">
            Seu pedido será enviado via WhatsApp para finalização.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
