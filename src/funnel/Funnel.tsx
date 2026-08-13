import { useState, useEffect, useMemo, type FC } from 'react';
import { Search, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Send, Gamepad2, HardDrive, CircleCheck as CheckCircle2, User, Phone, MapPin, X, ShoppingBag, Sparkles, Package, Loader as Loader2, CircleAlert as AlertCircle, Receipt } from 'lucide-react';
import type { Game, Accessory, ConsoleModel, ConsoleStatus, SelectedGame, SelectedAccessory, StoreSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import WhatsAppButton from '@/components/WhatsAppButton';
import TrackOrder from '@/components/TrackOrder';

type Step = 'builder' | 'contact' | 'upsell' | 'invoice' | 'success';

const CONSOLE_MODELS: { value: ConsoleModel; label: string; desc: string }[] = [
  { value: 'Fat', label: 'Fat', desc: 'Modelo original' },
  { value: 'Slim', label: 'Slim', desc: 'Modelo intermediário' },
  { value: 'Super Slim', label: 'Super Slim', desc: 'Modelo compacto' },
  { value: 'Nao sei', label: 'Não sei', desc: 'Sou leigo' },
];

const CONSOLE_STATUS: { value: ConsoleStatus; label: string; desc: string }[] = [
  { value: 'desbloqueado', label: 'Já é desbloqueado', desc: 'RGH / JTAG' },
  { value: 'bloqueado', label: 'Ainda é original', desc: 'Precisa desbloquear' },
  { value: 'Nao sei', label: 'Não sei', desc: 'Sou leigo' },
];

const Funnel: FC = () => {
  const [step, setStep] = useState<Step>('builder');
  const [model, setModel] = useState<ConsoleModel | null>(null);
  const [status, setStatus] = useState<ConsoleStatus | null>(null);
  const [search, setSearch] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const [games, setGames] = useState<Game[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingCatalog(true);
      setCatalogError(false);
      const [gamesRes, accRes, settingsRes] = await Promise.all([
        supabase.from('games').select('*').order('name'),
        supabase.from('accessories').select('*').order('name'),
        supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
      ]);
      if (gamesRes.error || accRes.error || settingsRes.error) {
        setCatalogError(true);
      } else {
        setGames(gamesRes.data || []);
        setAccessories(accRes.data || []);
        setSettings(settingsRes.data);
      }
      setLoadingCatalog(false);
    })();
  }, []);

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
  }, [search, games]);

  const tier1Max = settings?.tier_1_max ?? 15;
  const tier2Max = settings?.tier_2_max ?? 25;
  const tier3Max = settings?.tier_3_max ?? 30;
  const MAX_GAMES = tier3Max;

  const addGame = (game: Game) => setSelectedGames((prev) => {
    if (prev.length >= MAX_GAMES) return prev;
    return prev.some((g) => g.id === game.id) ? prev : [...prev, game];
  });
  const removeGame = (id: string) => setSelectedGames((prev) => prev.filter((g) => g.id !== id));
  const clearGames = () => setSelectedGames([]);

  const addCustomGame = () => {
    const trimmed = customGameName.trim();
    if (!trimmed) return;
    if (selectedGames.length >= MAX_GAMES) return;
    const customId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const customGame: Game = { id: customId, name: trimmed, genre: 'Personalizado', year: null };
    setSelectedGames((prev) => [...prev, customGame]);
    setCustomGameName('');
  };

  const toggleAccessory = (acc: Accessory) => {
    setSelectedAccessories((prev) =>
      prev.some((a) => a.id === acc.id) ? prev.filter((a) => a.id !== acc.id) : [...prev, acc]
    );
  };

  const canAdvanceBuilder = model !== null && status !== null && selectedGames.length > 0;
  const canSubmitContact = name.trim() !== '' && phone.replace(/\D/g, '').length >= 10 && neighborhood.trim() !== '';

  const formatBRL = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  const calculatePricing = () => {
    const count = selectedGames.length;
    const p1 = settings?.price_package_1 ?? 120;
    const p2 = settings?.price_package_2 ?? 150;
    const p3 = settings?.price_package_3 ?? 180;
    const unlockFee = settings?.price_unlock_rgh ?? 5;
    const t1 = settings?.tier_1_max ?? 15;
    const t2 = settings?.tier_2_max ?? 25;
    const t3 = settings?.tier_3_max ?? 30;

    let packagePrice = 0;
    let packageLabel = '';
    if (count > 0 && count <= t1) { packagePrice = p1; packageLabel = `Pacote 1 — Até ${t1} jogos`; }
    else if (count <= t2) { packagePrice = p2; packageLabel = `Pacote 2 — Até ${t2} jogos`; }
    else { packagePrice = p3; packageLabel = `Pacote 3 — Até ${t3} jogos`; }

    const needsUnlock = status === 'bloqueado';
    const unlockPrice = needsUnlock ? unlockFee : 0;
    const total = packagePrice + unlockPrice;

    return { packagePrice, packageLabel, needsUnlock, unlockPrice, total, gameCount: count };
  };

  const pricing = calculatePricing();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const statusLabel = (s: string) =>
    s === 'desbloqueado' ? 'Desbloqueado (RGH/JTAG)' : s === 'bloqueado' ? 'Original (bloqueado)' : 'Não sei / Sou leigo';

  // Submit the main order (console + games + contact data)
  const finalizeOrder = async () => {
    if (!canSubmitContact || !model || !status) return;
    setSubmitting(true);
    setSubmitError(false);

    const gameSnapshots: SelectedGame[] = selectedGames.map((g) => ({
      id: g.id, name: g.name, genre: g.genre, status: 'pendente' as const,
    }));

    const { data, error } = await supabase.from('orders').insert({
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      neighborhood: neighborhood.trim(),
      console_model: model,
      console_status: status,
      selected_games: gameSnapshots,
      selected_accessories: [],
      total_price: pricing.total,
    }).select('id').single();

    if (error || !data) {
      setSubmitting(false);
      setSubmitError(true);
      return;
    }

    const newOrderId = data.id;
    setOrderId(newOrderId);

    // Capture custom (manually-typed) games as suggestions for admin review
    const customGames = selectedGames.filter((g) => g.id.startsWith('custom-'));
    if (customGames.length > 0) {
      const suggestionRows = customGames.map((g) => ({
        game_name: g.name,
        suggested_by: name.trim(),
        order_id: newOrderId,
        status: 'pendente' as const,
      }));
      await supabase.from('game_suggestions').insert(suggestionRows);
    }

    // Auto-create a lead from the order data
    const interestsText = `${model} • ${selectedGames.length} jogos`;
    await supabase.from('leads').insert({
      name: name.trim(),
      phone: phone.trim(),
      neighborhood: neighborhood.trim(),
      interests: interestsText,
      status: 'comprou' as const,
      contact_date: new Date().toISOString().slice(0, 10),
      order_id: newOrderId,
    });

    setSubmitting(false);
    goToNextPostPurchaseStep();
  };

  // Add selected accessories to the already-created order
  const addAccessoriesToOrder = async () => {
    if (orderId && selectedAccessories.length > 0) {
      const accSnapshots: SelectedAccessory[] = selectedAccessories.map((a) => ({ id: a.id, name: a.name, price: a.price }));
      await supabase.from('orders').update({ selected_accessories: accSnapshots }).eq('id', orderId);
    }
    goToNextPostPurchaseStep('upsell');
  };

  const skipAccessories = () => {
    goToNextPostPurchaseStep('upsell');
  };

  const goToNextPostPurchaseStep = (fromStep?: 'contact' | 'upsell') => {
    const order = settings?.post_purchase_order ?? 'upsell_first';
    const upsellActive = settings?.upsell_enabled && accessories.length > 0;
    const invoiceActive = settings?.invoice_screen_enabled ?? true;

    if (fromStep === 'upsell') {
      // After upsell, go to invoice (if active) then success
      if (invoiceActive) {
        setStep('invoice');
      } else {
        setStep('success');
      }
      return;
    }

    // from contact (initial call)
    if (order === 'upsell_first') {
      if (upsellActive) {
        setStep('upsell');
      } else if (invoiceActive) {
        setStep('invoice');
      } else {
        setStep('success');
      }
    } else {
      // invoice_first
      if (invoiceActive) {
        setStep('invoice');
      } else if (upsellActive) {
        setStep('upsell');
      } else {
        setStep('success');
      }
    }
  };

  const goToSuccess = () => setStep('success');

  const restart = () => {
    setStep('builder');
    setModel(null);
    setStatus(null);
    setSearch('');
    setSelectedGames([]);
    setSelectedAccessories([]);
    setName('');
    setPhone('');
    setNeighborhood('');
    setOrderId(null);
    setSubmitError(false);
  };

  const heroTitle = settings?.hero_title || 'Monte seu HD de Xbox 360';
  const heroSubtitle = settings?.hero_subtitle || 'Escolha seu console, selecione os jogos e finalize seu pedido.';
  const badgeText = settings?.badge_text || 'Xbox 360';
  const bgImageUrl = settings?.background_image_url;

  const bgStyle: React.CSSProperties = bgImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {};

  return (
    <div className="min-h-screen bg-neutral-950 relative" style={bgStyle}>
      {settings?.whatsapp_button_enabled && settings.whatsapp_number && (
        <WhatsAppButton number={settings.whatsapp_number} />
      )}
      {!bgImageUrl && (
        <>
          <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(16,124,16,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,124,16,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
          <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-xbox-500/10 to-transparent pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-xbox-500/10 border border-xbox-500/30 mb-3">
            <Gamepad2 className="w-4 h-4 text-xbox-400" />
            <span className="text-xs font-semibold text-xbox-400 uppercase tracking-wider">{badgeText}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-glow leading-tight">{heroTitle}</h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">{heroSubtitle}</p>
          {step === 'builder' && (
            <button
              onClick={() => setShowTrackModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800/80 text-neutral-200 text-sm font-semibold hover:bg-neutral-700 border border-neutral-700 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" /> Acompanhar meu Pedido
            </button>
          )}
        </header>

        {/* Loading state */}
        {loadingCatalog && step === 'builder' && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-xbox-400 mb-3" />
            <p className="text-sm">Carregando catálogo de jogos...</p>
          </div>
        )}

        {/* Error state */}
        {catalogError && step === 'builder' && !loadingCatalog && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm text-neutral-400 mb-1">Não foi possível carregar o catálogo.</p>
            <p className="text-xs text-neutral-600">Tente recarregar a página em instantes.</p>
          </div>
        )}

        {/* STEP: Builder */}
        {step === 'builder' && !loadingCatalog && !catalogError && (
          <div className="space-y-5 animate-slide-up">
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-5 h-5 text-xbox-400" />
                <h2 className="text-lg font-bold text-white">Dados do Console</h2>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Modelo do Xbox 360</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONSOLE_MODELS.map((m) => (
                    <button key={m.value} onClick={() => setModel(m.value)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${model === m.value ? 'border-xbox-500 bg-xbox-500/15 text-white' : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600'}`}>
                      <span className="text-sm font-bold">{m.label}</span>
                      <span className="text-[10px] opacity-70">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Status do Console</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CONSOLE_STATUS.map((s) => (
                    <button key={s.value} onClick={() => setStatus(s.value)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all text-left ${status === s.value ? 'border-xbox-500 bg-xbox-500/15 text-white' : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600'}`}>
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

            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-xbox-400" />
                <h2 className="text-lg font-bold text-white">Catálogo de Jogos</h2>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jogo por nome ou gênero..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Custom game input */}
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 mb-2">Não encontrou seu jogo? Digite o nome aqui:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGameName}
                    onChange={(e) => setCustomGameName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomGame(); } }}
                    placeholder="Ex: Skate 3"
                    disabled={selectedGames.length >= MAX_GAMES}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={addCustomGame}
                    disabled={!customGameName.trim() || selectedGames.length >= MAX_GAMES}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-700 text-white text-sm font-semibold hover:bg-neutral-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {selectedGames.length >= MAX_GAMES && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Limite máximo de {MAX_GAMES} jogos atingido. Remova um jogo para adicionar outro.
                  </div>
                )}
                {filteredGames.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">Nenhum jogo encontrado para "{search}"</div>
                ) : (
                  filteredGames.map((game) => {
                    const isSelected = selectedGames.some((g) => g.id === game.id);
                    return (
                      <div key={game.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'border-xbox-500/40 bg-xbox-500/5' : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-700'}`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                          <p className="text-xs text-neutral-500">{game.genre}{game.year ? ` • ${game.year}` : ''}</p>
                        </div>
                        <button onClick={() => addGame(game)} disabled={isSelected}
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-xbox-500/20 text-xbox-400 cursor-default' : 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-95'}`}>
                          {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-xbox-400" />
                  <h2 className="text-lg font-bold text-white">Meus Jogos</h2>
                </div>
                {selectedGames.length > 0 && (
                  <button onClick={clearGames} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Limpar
                  </button>
                )}
              </div>

              {selectedGames.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  Nenhum jogo selecionado ainda.<br />Use a busca acima e adicione seus favoritos.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedGames.map((game, index) => (
                    <div key={game.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-xbox-500/20 text-xbox-400 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                          <p className="text-xs text-neutral-500">{game.genre}</p>
                        </div>
                      </div>
                      <button onClick={() => removeGame(game.id)} className="shrink-0 w-9 h-9 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all active:scale-95">
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-sm text-neutral-400">Total de jogos</span>
                <span className="text-2xl font-bold text-xbox-400 font-heading">{selectedGames.length}</span>
              </div>
            </section>

            <button onClick={() => canAdvanceBuilder && setStep('contact')} disabled={!canAdvanceBuilder}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all ${canAdvanceBuilder ? 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] animate-pulse-glow' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}>
              Avançar para Contato <ArrowRight className="w-5 h-5" />
            </button>
            {!canAdvanceBuilder && <p className="text-center text-xs text-neutral-500">Selecione o modelo, o status e pelo menos 1 jogo para continuar</p>}
          </div>
        )}

        {/* STEP: Contact */}
        {step === 'contact' && (
          <div className="space-y-5 animate-slide-up">
            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-xbox-400" /> Seus Dados
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome completo"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bairro</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Digite seu bairro"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors" />
                  </div>
                </div>
              </div>
            </section>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao registrar pedido. Tente novamente.
              </div>
            )}

            <div className="space-y-3">
              <button onClick={finalizeOrder} disabled={submitting || !canSubmitContact}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all ${canSubmitContact && !submitting ? 'bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] animate-pulse-glow' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}>
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</> : <><Send className="w-5 h-5" /> Finalizar Pedido</>}
              </button>
              <button onClick={() => setStep('builder')} disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
            {!canSubmitContact && !submitting && <p className="text-center text-xs text-neutral-500">Preencha todos os campos para finalizar</p>}
          </div>
        )}

        {/* STEP: Invoice (post-purchase) */}
        {step === 'invoice' && (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-xbox-500/15 border-2 border-xbox-500 flex items-center justify-center mb-5">
              <Receipt className="w-8 h-8 text-xbox-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Resumo do Pedido</h2>
            <p className="text-neutral-400 text-sm mb-6">Confira os detalhes do seu pedido.</p>
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm text-left mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-neutral-400">Console</span><span className="text-white font-semibold">{model}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Status</span><span className="text-white font-semibold text-right">{status ? statusLabel(status) : ''}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Jogos</span><span className="text-white font-semibold">{selectedGames.length}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Acessórios</span><span className="text-white font-semibold">{selectedAccessories.length}</span></div>
                <div className="pt-3 border-t border-neutral-800 flex justify-between">
                  <span className="text-neutral-400 font-bold">Valor Total</span>
                  <span className="text-xbox-400 font-bold">{formatBRL(pricing.total)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => {
              const upsellActive = settings?.upsell_enabled && accessories.length > 0;
              setStep(upsellActive ? 'upsell' : 'success');
            }} className="w-full max-w-sm flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] transition-all">
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP: Upsell (post-purchase) */}
        {step === 'upsell' && (
          <div className="space-y-5 animate-slide-up">
            {/* Confirmation banner */}
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 rounded-full bg-xbox-500/15 border-2 border-xbox-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-xbox-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Pedido Confirmado!</h2>
              <p className="text-sm text-neutral-400 max-w-sm">Aproveite e adicione um acessório antes do envio. Completemos seu setup com um preço especial.</p>
            </div>

            <section className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-xbox-400" />
                <h3 className="text-lg font-bold text-white">Acessórios Disponíveis</h3>
              </div>

              {accessories.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">Nenhum acessório disponível no momento.</div>
              ) : (
                <div className="space-y-2">
                  {accessories.map((acc) => {
                    const isSelected = selectedAccessories.some((a) => a.id === acc.id);
                    return (
                      <div key={acc.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'border-xbox-500/40 bg-xbox-500/5' : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-700'}`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {acc.image_url ? (
                            <img src={acc.image_url} alt={acc.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-700 flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-neutral-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{acc.name}</p>
                            <p className="text-sm text-xbox-400 font-bold">R$ {acc.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleAccessory(acc)}
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95 ${isSelected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-xbox-500 text-white hover:bg-xbox-400'}`}>
                          {isSelected ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedAccessories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-400">Acessórios selecionados</span>
                    <span className="text-sm font-bold text-white">{selectedAccessories.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Subtotal</span>
                    <span className="text-lg font-bold text-xbox-400">R$ {selectedAccessories.reduce((sum, a) => sum + a.price, 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              )}
            </section>

            <div className="space-y-3">
              <button onClick={addAccessoriesToOrder} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all bg-xbox-500 text-white hover:bg-xbox-400 active:scale-[0.98] animate-pulse-glow">
                <ShoppingBag className="w-5 h-5" /> {selectedAccessories.length > 0 ? `Adicionar ao Pedido (${selectedAccessories.length})` : 'Adicionar ao Pedido'}
              </button>
              <button onClick={skipAccessories} className="w-full py-3 rounded-2xl text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all">
                Não, obrigado. Finalizar pedido.
              </button>
            </div>
          </div>
        )}

        {/* STEP: Success — redirects to order tracking */}
        {step === 'success' && orderId && (
          <div className="animate-slide-up">
            <div className="flex flex-col items-center text-center py-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-xbox-500/15 border-2 border-xbox-500 flex items-center justify-center mb-4 animate-pulse-glow">
                <CheckCircle2 className="w-8 h-8 text-xbox-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Pedido Confirmado!</h2>
              <p className="text-sm text-neutral-400 max-w-sm">Acompanhe o status da montagem do seu HD abaixo.</p>
            </div>
            <TrackOrder initialOrderId={orderId} inline onNewOrder={restart} />
          </div>
        )}

        <footer className="text-center mt-8 pb-4">
          <p className="text-xs text-neutral-600">Seu pedido será processado e entraremos em contato via WhatsApp.</p>
        </footer>
      </div>

      {showTrackModal && (
        <TrackOrder onClose={() => setShowTrackModal(false)} />
      )}
    </div>
  );
};

export default Funnel;
