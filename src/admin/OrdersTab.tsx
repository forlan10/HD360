import { useState, useEffect, type FC } from 'react';
import { ClipboardList, Search, Phone, MapPin, HardDrive, CheckCircle2, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
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

const OrdersTab: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) setError(true);
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await supabase.from('orders').delete().eq('id', id);
  };

  const filtered = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search) ||
    o.neighborhood.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState text="Carregando pedidos..." />;
  if (error) return <ErrorState text="Erro ao carregar pedidos." onRetry={load} />;

  return (
    <div className="space-y-3">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou bairro..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} text={search ? 'Nenhum pedido encontrado.' : 'Nenhum pedido recebido ainda.'} />
      ) : (
        filtered.map((order) => (
          <div key={order.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-neutral-800/30 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white truncate">{order.customer_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge(order.status).color}`}>
                    {statusBadge(order.status).label}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{order.customer_phone} • {order.neighborhood} • {order.console_model}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-neutral-500">{order.selected_games.length} jogos</p>
                <p className="text-xs text-neutral-500">{order.selected_accessories.length} acessórios</p>
                {order.total_price != null && <p className="text-sm font-bold text-xbox-400 mt-0.5">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>}
              </div>
            </button>

            {expanded === order.id && (
              <div className="border-t border-neutral-800 p-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{order.customer_phone}</span></div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{order.neighborhood}</span></div>
                  <div className="flex items-center gap-2 text-sm"><HardDrive className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{order.console_model}</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-neutral-500" /><span className="text-neutral-300">{statusLabel(order.console_status)}</span></div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2"><ShoppingBag className="w-4 h-4 text-xbox-400" /><span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Jogos ({order.selected_games.length})</span></div>
                  <div className="flex flex-wrap gap-1.5">
                    {order.selected_games.map((g, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-md bg-xbox-500/15 text-xbox-300 border border-xbox-500/20">{g.name}</span>
                    ))}
                  </div>
                </div>

                {order.selected_accessories.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-xbox-400" /><span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Acessórios ({order.selected_accessories.length})</span></div>
                    <div className="flex flex-wrap gap-1.5">
                      {order.selected_accessories.map((a, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">{a.name} — R$ {a.price.toFixed(2).replace('.', ',')}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                  {order.total_price != null && (
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Valor do Pedido</span>
                      <span className="text-sm font-bold text-xbox-400">R$ {order.total_price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  {ORDER_STATUS.map((s) => (
                    <button key={s.value} onClick={() => updateStatus(order.id, s.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${order.status === s.value ? s.color : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'}`}>
                      {s.label}
                    </button>
                  ))}
                  <button onClick={() => deleteOrder(order.id)} className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersTab;
