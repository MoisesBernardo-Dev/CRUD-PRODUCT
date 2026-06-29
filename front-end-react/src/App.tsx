import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Products } from './components/Products';
import { AdminDashboard } from './components/AdminDashboard';
import { authApi } from './services/api';

function App() {
  const [screen, setScreen] = useState<'login' | 'register' | 'dashboard' | 'admin'>('login');
  const [loading, setLoading] = useState(true);

  const checkUserRole = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setScreen('login');
      setLoading(false);
      return;
    }

    try {
      // Pergunta para o Auth Service quem é este usuário baseado no token atual
      const response = await authApi.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.role === 'admin') {
        setScreen('admin');
      } else {
        setScreen('dashboard');
      }
    } catch (error) {
      // Se o token estiver expirado ou for inválido, limpa e manda pro login
      localStorage.removeItem('token');
      setScreen('login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  const handleAuthSuccess = () => {
    checkUserRole();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setScreen('login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-600">A carregar o sistema...</p>
      </div>
    );
  }

  if (screen === 'login') {
    return <Login onLoginSuccess={handleAuthSuccess} onNavigateToRegister={() => setScreen('register')} />;
  }

  if (screen === 'register') {
    return <Register onRegisterSuccess={handleAuthSuccess} onNavigateToLogin={() => setScreen('login')} />;
  }

  if (screen === 'admin') {
    return (
      <AdminDashboard 
        onLogout={handleLogout} 
        onGoToProducts={() => setScreen('dashboard')} 
      />
    );
  }

  return <Products onLogout={handleLogout} />;
}

export default App;
