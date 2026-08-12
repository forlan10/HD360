import { useState, useEffect, useMemo, type FC } from 'react';
import { Users, Search, Plus, Trash2, Loader as Loader2, CircleCheck as CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, Phone, MapPin, Calendar, X, Pencil } from 'lucide-react';
import type { Lead, LeadStatus } from '@/types';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, Modal, Field, inputClass } from './shared';

const LEAD_STATUS_LIST = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
  value: value as LeadStatus,
  label,
}));

const daysSince = (dateStr: string): number => {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

const daysLabel = (dateStr: string): string => {
  const days = daysSince(dateStr);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Há 1 dia';
  return `Há ${days} dias`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

type SortField = 'contact_date' | 'status' | 'neighborhood' | 'name';
type SortDir = 'asc' | 'desc';

const LeadsTab: FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('contact_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) setError(true);
    else setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l)));
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await supabase.from('leads').delete().eq('id', id);
  };

  // Unique neighborhoods for filter dropdown
  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => { if (l.neighborhood) set.add(l.neighborhood); });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered + sorted leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.neighborhood || '').toLowerCase().includes(q) ||
        (l.interests || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter);
    }

    // Neighborhood filter
    if (neighborhoodFilter !== 'all') {
      result = result.filter((l) => l.neighborhood === neighborhoodFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'contact_date':
          cmp = new Date(a.contact_date).getTime() - new Date(b.contact_date).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'neighborhood':
          cmp = (a.neighborhood || '').localeCompare(b.neighborhood || '');
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [leads, search, statusFilter, neighborhoodFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-neutral-600" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-xbox-400" /> : <ArrowDown className="w-3.5 h-3.5 text-xbox-400" />;
  };

  if (loading) return <LoadingState text="Carregando leads..." />;
  if (error) return <ErrorState text="Erro ao carregar leads." onRetry={load} />;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lead..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 transition-colors" />
        </div>
        <button onClick={() => { setEditingLead(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-xbox-500 text-white text-sm font-semibold hover:bg-xbox-400 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-xbox-500 transition-colors"
        >
          <option value="all">Todos os status</option>
          {LEAD_STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-xbox-500 transition-colors"
        >
          <option value="all">Todos os bairros</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {(statusFilter !== 'all' || neighborhoodFilter !== 'all' || search) && (
          <button
            onClick={() => { setStatusFilter('all'); setNeighborhoodFilter('all'); setSearch(''); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-all"
          >
            <X className="w-4 h-4" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Leads list */}
      {processedLeads.length === 0 ? (
        <EmptyState icon={Users} text={search || statusFilter !== 'all' || neighborhoodFilter !== 'all' ? 'Nenhum lead encontrado.' : 'Nenhum lead cadastrado ainda.'} />
      ) : (
        <div className="space-y-2">
          {/* Sort header */}
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
            <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors">
              Lead {sortIcon('name')}
            </button>
            <span className="text-neutral-700">•</span>
            <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-white transition-colors">
              Status {sortIcon('status')}
            </button>
            <span className="text-neutral-700">•</span>
            <button onClick={() => toggleSort('neighborhood')} className="flex items-center gap-1 hover:text-white transition-colors">
              Bairro {sortIcon('neighborhood')}
            </button>
            <span className="ml-auto" />
            <button onClick={() => toggleSort('contact_date')} className="flex items-center gap-1 hover:text-white transition-colors">
              Data {sortIcon('contact_date')}
            </button>
          </div>

          {processedLeads.map((lead) => (
            <div key={lead.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate">{lead.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${LEAD_STATUS_COLORS[lead.status]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                    {lead.neighborhood && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.neighborhood}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(lead.contact_date)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700 font-semibold">
                      {daysLabel(lead.contact_date)}
                    </span>
                  </div>
                  {lead.interests && (
                    <p className="text-xs text-neutral-400 mt-1.5 truncate">Interesses: {lead.interests}</p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => { setEditingLead(lead); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteLead(lead.id)} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline status selector */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-800">
                {LEAD_STATUS_LIST.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(lead.id, s.value)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${lead.status === s.value ? LEAD_STATUS_COLORS[s.value] : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LeadForm
          lead={editingLead}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
};

// ===================== LEAD FORM =====================
const LeadForm: FC<{ lead: Lead | null; onClose: () => void; onSaved: () => void }> = ({ lead, onClose, onSaved }) => {
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [neighborhood, setNeighborhood] = useState(lead?.neighborhood || '');
  const [interests, setInterests] = useState(lead?.interests || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'nao_respondeu');
  const [contactDate, setContactDate] = useState(lead?.contact_date || new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      neighborhood: neighborhood.trim() || null,
      interests: interests.trim() || null,
      status,
      contact_date: contactDate,
      updated_at: new Date().toISOString(),
    };
    if (lead) {
      await supabase.from('leads').update(payload).eq('id', lead.id);
    } else {
      await supabase.from('leads').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={lead ? 'Editar Lead' : 'Novo Lead'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome *">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do contato" className={inputClass} />
        </Field>
        <Field label="Telefone / WhatsApp">
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className={inputClass} />
        </Field>
        <Field label="Bairro">
          <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className={inputClass} />
        </Field>
        <Field label="Interesses" hint="Console, jogos ou outros interesses do lead">
          <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Ex: Xbox 360 Fat, GTA V, Halo" className={inputClass} />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={inputClass}>
            {LEAD_STATUS_LIST.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Data do Contato">
          <input type="date" value={contactDate} onChange={(e) => setContactDate(e.target.value)} className={inputClass} />
        </Field>
        <button onClick={save} disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {lead ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </Modal>
  );
};

export default LeadsTab;
