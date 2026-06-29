import React, { useEffect, useState } from 'react';
import { authApi } from '../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
  onGoToProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onGoToProducts }) => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchTotalUsers = async () => {
    try {
      // Adiciona o token manualmente para garantir o envio correto na rota admin
      const token = localStorage.getItem('token');
      const response = await authApi.get('/users/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalUsers(response.data.total_users);
    } catch (err) {
      setError('Erro ao carregar o total de clientes. Acesso negado.');
    }
  };

  useEffect(() => {
    fetchTotalUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl bg-white rounded-lg p-8 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
            <p className="text-sm text-gray-500">Visão do Dono do Sistema</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onGoToProducts} className="rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">
              Gerenciar Meus Produtos
            </button>
            <button onClick={onLogout} className="rounded bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700">
              Sair
            </button>
          </div>
        </div>

        {error && <div className="rounded bg-red-100 p-3 text-sm text-red-700 mb-6">{error}</div>}

        {/* Card do Contador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total de Clientes Cadastrados</span>
            <span className="mt-2 text-5xl font-extrabold text-blue-600">
              {totalUsers !== null ? totalUsers : '...'}
            </span>
          </div>
          
          <div className="rounded-xl border border-gray-200 bg-blue-50 p-6 flex flex-col justify-center shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Métricas do Sistema</h3>
            <p className="text-sm text-blue-700">
              Como administrador, você tem acesso ao controle global de usuários. O isolamento de banco de dados por microsserviço garante a segurança das informações comerciais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
