import { useState, useEffect, type FC } from 'react';
import Funnel from '@/funnel/Funnel';
import Admin from '@/admin/Admin';
import { AuthProvider } from '@/lib/auth';

const App: FC = () => {
  const [route, setRoute] = useState<string>(window.location.pathname);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route === '/admin') {
    return (
      <AuthProvider>
        <Admin />
      </AuthProvider>
    );
  }

  return <Funnel />;
};

export default App;
