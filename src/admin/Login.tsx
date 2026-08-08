import { useState, type FC } from 'react';
import { Gamepad, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const Login: FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(16,124,16,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,124,16,1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-xbox-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-xbox-500/15 border border-xbox-500/30 items-center justify-center mb-4">
            <Gamepad className="w-8 h-8 text-xbox-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">Painel Administrativo</h1>
          <p className="text-sm text-neutral-500 mt-1">Faça login para gerenciar a loja</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                autoComplete="email"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <button onClick={goHome} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </button>
      </div>
    </div>
  );
};

export default Login;
