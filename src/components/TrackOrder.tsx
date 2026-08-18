import { useState, useEffect, useMemo, type FC } from 'react';
import { Search, X, Loader as Loader2, CircleAlert as AlertCircle, HardDrive, Package, RotateCcw, CircleCheck as CheckCircle2, Clock } from 'lucide-react';
import type { Order } from '@/types';
import { supabase } from '@/lib/supabase';

const TrackOrder: FC<{
  initialOrderId?: string | null;
  onClose?: () => void;
  onNewOrder?: () => void;
  inline?: boolean;
}> = ({ initialOrderId, onClose, onNewOrder, inline = false }) => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      searchById(initialOrderId);
    }
  }, [initialOrderId]);

  const searchById = async (id: string) => {
    setLoading(true);
    setNotFound(false);
    const { data, error } = await supabase.rpc('track_order', {
      p_phone: null,
      p_order_id: id,
    }).maybeSingle();
    if (error || !data) {
      setOrder(null);
      setNotFound(true);
    } else {
      setOrder(data as unknown as Order);
    }
    setLoading(false);
  };

  const searchByInput = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setNotFound(false);
    const { data, error } = await supabase.rpc('track_order', {
      p_phone: q,
      p_order_id: q,
    }).maybeSingle();
    if (error || !data) {
      setOrder(null);
      setNotFound(true);
    } else {
      setOrder(data as unknown as Order);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!order || !order.selected_games || order.selected_games.length === 0) return null;
    const games = order.selected_games;
    const total = games.length;
    const readyCount = games.filter((g) => (g.status || 'pendente') === 'no_hd').length;
    const overall = Math.round((readyCount / total) * 100);
    return { overall, readyCount, total };
  }, [order]);

  const resetSearch = () => {
    setOrder(null);
    setNotFound(false);
    setQuery('');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-xbox-400 mb-3" />
          <p className="text-sm text-neutral-500">Buscando seu pedido...</p>
        </div>
      );
    }

    if (notFound) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-400 mb-1">Pedido não encontrado</p>
          <p className="text-xs text-neutral-600 mb-4">Verifique se o telefone ou ID do pedido estão corretos.</p>
          <button onClick={resetSearch} className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-700 transition-all">
            Buscar novamente
          </button>
        </div>
      );
    }

    if (order && stats) {
      return (
        <div className="space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-xbox-500/10 border border-xbox-500/30 mb-3">
              <HardDrive className="w-4 h-4 text-xbox-400" />
              <span className="text-xs font-semibold text-xbox-400 uppercase tracking-wider">Status da Montagem</span>
            </div>
            <h2 className="text-xl font-bold text-white">HD de {order.customer_name}</h2>
            <p className="text-xs text-neutral-500 mt-1">{order.console_model} • {stats.total} jogos</p>
          </div>

          {/* Overall progress bar — the only bar */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Conclusão Geral</span>
              <span className="text-lg font-bold text-xbox-400">{stats.overall}%</span>
            </div>
            <div className="h-4 rounded-full bg-neutral-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-xbox-600 to-xbox-400 rounded-full transition-all duration-700" style={{ width: `${stats.overall}%` }} />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {stats.readyCount} de {stats.total} jogos prontos
            </p>
          </div>

          {/* Game list with simplified status */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Jogos do Pedido</h3>
            {order.selected_games.map((game, i) => {
              const isReady = (game.status || 'pendente') === 'no_hd';
              return (
                <div key={game.id || i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-700 text-neutral-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                  </div>
                  {isReady ? (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-xbox-400 px-2.5 py-1 rounded-lg bg-xbox-500/15 border border-xbox-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400 px-2.5 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/30">
                      <Clock className="w-3.5 h-3.5" /> Em andamento
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {inline && onNewOrder && (
            <button onClick={onNewOrder} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95">
              <RotateCcw className="w-4 h-4" /> Fazer Novo Pedido
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-xbox-500/10 border border-xbox-500/30 mb-3">
            <Package className="w-4 h-4 text-xbox-400" />
            <span className="text-xs font-semibold text-xbox-400 uppercase tracking-wider">Rastreamento</span>
          </div>
          <h3 className="text-lg font-bold text-white">Acompanhar meu Pedido</h3>
          <p className="text-sm text-neutral-500 mt-1">Digite seu telefone ou o ID do pedido para ver o status da montagem.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') searchByInput(); }}
            placeholder="Telefone ou ID do pedido"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors"
          />
        </div>
        <button
          onClick={searchByInput}
          disabled={!query.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar Pedido
        </button>
      </div>
    );
  };

  if (inline) {
    return <div className="animate-slide-up">{renderContent()}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Acompanhar Pedido</h3>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default TrackOrder;