import { useState, useEffect, useMemo, type FC } from 'react';
import { ClipboardList, Search, Phone, MapPin, HardDrive, CircleCheck as CheckCircle2, ShoppingBag, Sparkles, Trash2, X, ChevronRight, Download, CircleAlert as AlertCircle, CloudOff } from 'lucide-react';
import type { Order, OrderStatus, SelectedGame, GameProductionStatus, MasterLibraryEntry } from '@/types';
import { GAME_STATUS_ORDER, GAME_STATUS_LABELS, GAME_STATUS_SHORT, GAME_STATUS_COLORS } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState } from './shared';

const ORDER_STATUS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  { value: 'concluido', label: 'Concluído', color: 'bg-xbox-500/15 text-xbox-400 border-xbox-500/30' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
];

const statusBadge = (s: string) => ORDER_STATUS.find((o) => o.value === s) || ORDER_STATUS[0];
const statusLabel = (s: string) =>
  s === 'desbloqueado' ? 'Desbloqueado' : s === 'bloqueado' ? 'Original' : 'Não sei';

type OrderView = 'all' | 'prioritarios';

const OrdersTab: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [library, setLibrary] = useState<MasterLibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [view, setView] = useState<OrderView>('all');

  const load = async () => {
    setLoading(true);
    setError(false);
    const [ordersRes, libRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('master_library').select('*'),
    ]);
    if (ordersRes.error || libRes.error) setError(true);
    else {
      setOrders(ordersRes.data || []);
      setLibrary(libRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const libraryNames = useMemo(() => new Set(library.map((e) => e.game_name_normalized)), [library]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selectedOrder?.id === id) setSelectedOrder(null);
    await supabase.from('orders').delete().eq('id', id);
  };

  const updateGameStatus = async (orderId: string, gameId: string, newStatus: GameProductionStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedGames = order.selected_games.map((g) =>
      g.id === gameId ? { ...g, status: newStatus } : g
    );

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, selected_games: updatedGames } : o)));
    if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, selected_games: updatedGames } : null);

    await supabase.from('orders').update({ selected_games: updatedGames }).eq('id', orderId);
  };

  const filtered = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search) ||
    o.neighborhood.toLowerCase().includes(search.toLowerCase())
  );

  // For "Baixar Prioritários" view: only orders with at least one game not at no_hd
  const prioritarios = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelado' && o.status !== 'concluido')
      .map((o) => ({
        order: o,
        pendingGames: o.selected_games.filter((g) => (g.status || 'pendente') !== 'no_hd'),
      }))
      .filter(({ pendingGames }) => pendingGames.length > 0);
  }, [orders]);

  if (loading) return <LoadingState text="Carregando pedidos..." />;
  if (error) return <ErrorState text="Erro ao carregar pedidos." onRetry={load} />;

  return (
    <>
      {/* Sub-tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'all' ? 'bg-xbox-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
        >
          <ClipboardList className="w-4 h-4" /> Todos os Pedidos
        </button>
        <button
          onClick={() => setView('prioritarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'prioritarios' ? 'bg-xbox-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
        >
          <Download className="w-4 h-4" /> Baixar Prioritários
          {prioritarios.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-xbox-500/30 text-xbox-200 font-bold">{prioritarios.length}</span>
          )}
        </button>
      </div>

      {view === 'all' && (
        <div className="space-y-3">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou bairro..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={ClipboardList} text={search ? 'Nenhum pedido encontrado.' : 'Nenhum pedido recebido ainda.'} />
          ) : (
            filtered.map((order) => {
              const pendingCount = order.selected_games.filter((g) => (g.status || 'pendente') !== 'no_hd').length;
              const readyCount = order.selected_games.length - pendingCount;
              return (
                <div key={order.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden">
                  <button onClick={() => setSelectedOrder(order)} className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-neutral-800/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white truncate">{order.customer_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge(order.status).color}`}>
                          {statusBadge(order.status).label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{order.customer_phone} • {order.neighborhood} • {order.console_model}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                      {pendingCount > 0 && order.status !== 'cancelado' && order.status !== 'concluido' && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
                          <Download className="w-3 h-3" />
                          {pendingCount === order.selected_games.length
                            ? `Baixar ${pendingCount} jogo(s)`
                            : `Baixar apenas ${pendingCount} jogo(s) para concluir`}
                        </div>
                      )}
                      {pendingCount === 0 && order.selected_games.length > 0 && order.status !== 'cancelado' && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-xbox-500/10 border border-xbox-500/30 text-xbox-400 text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Todos os jogos prontos
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs text-neutral-500">{order.selected_games.length} jogos</p>
                        <p className="text-xs text-neutral-500">{readyCount}/{order.selected_games.length} prontos</p>
                        {order.total_price != null && <p className="text-sm font-bold text-xbox-400 mt-0.5">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>}
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-600" />
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {view === 'prioritarios' && (
        <div className="space-y-3">
          {prioritarios.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="Nenhum jogo pendente para baixar. Todos os pedidos estão com o HD pronto!" />
          ) : (
            prioritarios.map(({ order, pendingGames }) => (
              <div key={order.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden">
                <button onClick={() => setSelectedOrder(order)} className="w-full p-4 text-left hover:bg-neutral-800/30 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{order.customer_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge(order.status).color}`}>
                        {statusBadge(order.status).label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-600 shrink-0" />
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">{order.customer_phone} • {order.neighborhood}</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold mb-3">
                    <Download className="w-3 h-3" /> Baixar {pendingGames.length} jogo(s)
                  </div>
                  <div className="space-y-1.5">
                    {pendingGames.map((game, i) => (
                      <div key={game.id || i} className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        <span className="text-neutral-300 truncate">{game.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold shrink-0 ${GAME_STATUS_COLORS[(game.status || 'pendente') as GameProductionStatus]}`}>
                          {GAME_STATUS_SHORT[(game.status || 'pendente') as GameProductionStatus]}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          libraryNames={libraryNames}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => updateStatus(selectedOrder.id, status)}
          onGameStatusChange={(gameId, status) => updateGameStatus(selectedOrder.id, gameId, status)}
          onDelete={() => deleteOrder(selectedOrder.id)}
        />
      )}
    </>
  );
};

// ===================== PRODUCTION DRAWER =====================

const OrderDrawer: FC<{
  order: Order;
  libraryNames: Set<string>;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onGameStatusChange: (gameId: string, status: GameProductionStatus) => void;
  onDelete: () => void;
}> = ({ order, libraryNames, onClose, onStatusChange, onGameStatusChange, onDelete }) => {
  const games: SelectedGame[] = order.selected_games;
  const isInLibrary = (gameName: string) => libraryNames.has(gameName.toLowerCase().trim());

  const stats = useMemo(() => {
    const total = games.length || 1;
    const counts = { pendente: 0, baixado: 0, convertido: 0, no_hd: 0 };
    games.forEach((g) => {
      const s = g.status || 'pendente';
      counts[s]++;
    });
    return {
      pendente: (counts.pendente / total) * 100,
      baixado: (counts.baixado / total) * 100,
      convertido: (counts.convertido / total) * 100,
      no_hd: (counts.no_hd / total) * 100,
      total: games.length,
      pendingCount: counts.pendente + counts.baixado + counts.convertido,
      readyCount: counts.no_hd,
    };
  }, [games]);

  const progressBars = [
    { key: 'pendente' as const, label: 'Pendente', pct: stats.pendente, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { key: 'baixado' as const, label: 'Baixado', pct: stats.baixado, color: 'bg-blue-500', text: 'text-blue-400' },
    { key: 'convertido' as const, label: 'Convertido', pct: stats.convertido, color: 'bg-purple-500', text: 'text-purple-400' },
    { key: 'no_hd' as const, label: 'No HD', pct: stats.no_hd, color: 'bg-xbox-500', text: 'text-xbox-400' },
  ];

  const cycleGameStatus = (game: SelectedGame) => {
    const currentStatus = game.status || 'pendente';
    const currentIndex = GAME_STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % GAME_STATUS_ORDER.length;
    onGameStatusChange(game.id, GAME_STATUS_ORDER[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-neutral-950 border-l border-neutral-800 w-full max-w-md h-full overflow-y-auto scrollbar-thin animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Pedido — {order.customer_name}</h3>
            <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer info */}
          <section className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
              <Phone className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300 truncate">{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
              <MapPin className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300 truncate">{order.neighborhood}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
              <HardDrive className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{order.console_model}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{statusLabel(order.console_status)}</span>
            </div>
          </section>

          {/* Order status controls */}
          <section>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Status do Pedido</h4>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUS.map((s) => (
                <button key={s.value} onClick={() => onStatusChange(s.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${order.status === s.value ? s.color : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Production dashboard */}
          <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Progresso de Montagem do HD</h4>
              <span className="text-xs font-bold text-xbox-400">{stats.readyCount}/{stats.total} prontos</span>
            </div>

            {/* Effort summary */}
            {stats.pendingCount > 0 ? (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <Download className="w-4 h-4 text-yellow-400 shrink-0" />
                <p className="text-sm text-yellow-400 font-semibold">
                  {stats.pendingCount === stats.total
                    ? `Baixar ${stats.pendingCount} jogo(s) para concluir`
                    : `Baixar apenas ${stats.pendingCount} jogo(s) para concluir`}
                </p>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-xbox-500/10 border border-xbox-500/30">
                <CheckCircle2 className="w-4 h-4 text-xbox-400 shrink-0" />
                <p className="text-sm text-xbox-400 font-semibold">Todos os jogos já estão no HD!</p>
              </div>
            )}

            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-400">Conclusão geral</span>
                <span className="text-xs font-bold text-white">{stats.no_hd.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                {progressBars.map((bar) => (
                  bar.pct > 0 && (
                    <div
                      key={bar.key}
                      className={`${bar.color} h-full transition-all duration-500`}
                      style={{ width: `${bar.pct}%` }}
                    />
                  )
                ))}
              </div>
            </div>

            {/* Individual status bars */}
            <div className="space-y-2">
              {progressBars.map((bar) => (
                <div key={bar.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${bar.text}`}>{bar.label}</span>
                    <span className="text-xs text-neutral-500">{bar.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div className={`${bar.color} h-full rounded-full transition-all duration-500`} style={{ width: `${bar.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Games list with per-game status controls */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-xbox-400" />
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Jogos ({games.length})</h4>
            </div>
            <div className="space-y-2">
              {games.map((game, index) => {
                const gameStatus: GameProductionStatus = game.status || 'pendente';
                return (
                  <div key={game.id || index} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-xbox-500/20 text-xbox-400 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-neutral-500">{game.genre}</p>
                          {!isInLibrary(game.name) && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border font-semibold bg-orange-500/10 text-orange-400 border-orange-500/30 whitespace-nowrap">
                              <CloudOff className="w-3 h-3" /> Precisa baixar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-md border font-semibold whitespace-nowrap ${GAME_STATUS_COLORS[gameStatus]}`}>
                        {GAME_STATUS_SHORT[gameStatus]}
                      </span>
                      <button
                        onClick={() => cycleGameStatus(game)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700 transition-all active:scale-95 whitespace-nowrap"
                        title={GAME_STATUS_LABELS[gameStatus]}
                      >
                        Avançar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Accessories */}
          {order.selected_accessories.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-xbox-400" />
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Acessórios ({order.selected_accessories.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {order.selected_accessories.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {a.name} — R$ {a.price.toFixed(2).replace('.', ',')}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Total + delete */}
          <section className="pt-4 border-t border-neutral-800 space-y-3">
            {order.total_price != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Valor do Pedido</span>
                <span className="text-sm font-bold text-xbox-400">R$ {order.total_price.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold">
              <Trash2 className="w-4 h-4" /> Excluir Pedido
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;