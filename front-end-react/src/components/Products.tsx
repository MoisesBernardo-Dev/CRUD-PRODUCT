import React, { useEffect, useState } from 'react';
import { productApi } from '../services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface ProductsProps {
  onLogout: () => void;
}

export const Products: React.FC<ProductsProps> = ({ onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Carregar produtos do cliente logado
  const fetchProducts = async () => {
    try {
      const response = await productApi.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError('Erro ao carregar produtos.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Criar ou Atualizar Produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = { name, description, price: Number(price), stock: Number(stock) };

    try {
      if (editingId) {
        await productApi.put(`/products/${editingId}`, payload);
      } else {
        await productApi.post('/products', payload);
      }
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError('Erro ao salvar produto. Verifique os dados.');
    }
  };

  // Preparar Edição
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
  };

  // Apagar Produto
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja apagar este produto?')) {
      try {
        await productApi.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Erro ao apagar produto.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Os Meus Produtos</h1>
          <button onClick={onLogout} className="rounded bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700">
            Sair do Sistema
          </button>
        </div>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Formulário */}
          <div className="rounded-lg bg-white p-6 shadow-md h-fit">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nome do Produto</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Preço (kz)</label>
                  <input
                    type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Stock</label>
                  <input
                    type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                    className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="w-full rounded bg-blue-600 p-2 text-white font-semibold hover:bg-blue-700">
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setDescription(''); setPrice(''); setStock(''); }}
                    className="w-full rounded bg-gray-300 p-2 text-gray-700 font-semibold hover:bg-gray-400">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Listagem */}
          <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Lista de Produtos</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100 text-gray-600 text-sm font-semibold">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Preço</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{product.name}</td>
                        <td className="p-3 text-gray-600">kz {Number(product.price).toFixed(2)}</td>
                        <td className="p-3 text-gray-600">{product.stock} un.</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={() => handleEdit(product)} className="rounded bg-yellow-500 px-3 py-1 text-white text-xs font-semibold hover:bg-yellow-600">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="rounded bg-red-600 px-3 py-1 text-white text-xs font-semibold hover:bg-red-700">
                            Apagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
