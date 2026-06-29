import React, { useState } from 'react';
import { authApi } from '../services/api';

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (password !== passwordConfirmation) {
      setErrors(['As senhas não coincidem.']);
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      onRegisterSuccess(token);
    } catch (err: any) {
      if (err.response?.data) {
        // Mapeia erros de validação vindos do Laravel Validator
        const laravelErrors = Object.values(err.response.data).flat() as string[];
        setErrors(laravelErrors.length ? laravelErrors : ['Erro ao criar conta.']);
      } else {
        setErrors(['Erro de conexão com o servidor.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">Criar Nova Conta</h2>
        
        {errors.length > 0 && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700 space-y-1">
            {errors.map((err, idx) => <p key={idx}>{err}</p>)}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 p-2 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'A processar...' : 'Registar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button onClick={onNavigateToLogin} className="font-medium text-blue-600 hover:underline">
            Faça login aqui
          </button>
        </p>
      </div>
    </div>
  );
};
