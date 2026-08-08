import { useState, type FC } from 'react';
import { ClipboardList, Gamepad2, Package, Settings, ArrowLeft, Gamepad, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Login from './Login';
import OrdersTab from './OrdersTab';
import GamesTab from './GamesTab';
import AccessoriesTab from './AccessoriesTab';
import SettingsTab from './SettingsTab';

type Tab = 'orders' | 'games' | 'accessories' | 'settings';

const TABS: { value: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'orders', label: 'Pedidos', icon: ClipboardList },
  { value: 'games', label: 'Jogos', icon: Gamepad2 },
  { value: 'accessories', label: 'Upsells', icon: Package },
  { value: 'settings', label: 'Personalização', icon: Settings },
];

const Admin: FC = () => {
  const { session, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('orders');

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-xbox-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(16,124,16,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,124,16,1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10">
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-xbox-500/15 border border-xbox-500/30 flex items-center justify-center">
                <Gamepad className="w-5 h-5 text-xbox-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-heading">Painel Admin</h1>
                <p className="text-xs text-neutral-500">HD Xbox 360 — Gerenciamento</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goHome} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all">
                <ArrowLeft className="w-4 h-4" /> Site
              </button>
              <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-red-400 bg-neutral-800/50 hover:bg-red-500/10 border border-neutral-800 transition-all">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.value} onClick={() => setTab(t.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.value ? 'bg-xbox-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'orders' && <OrdersTab />}
          {tab === 'games' && <GamesTab />}
          {tab === 'accessories' && <AccessoriesTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
