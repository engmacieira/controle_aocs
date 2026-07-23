import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Shield, UserX } from 'lucide-react';

interface UsuarioPermitido {
  id: string;
  email: string;
  role: string;
}

export function UsuariosPermitidos() {
  const [usuarios, setUsuarios] = useState<UsuarioPermitido[]>([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isMock = typeof window !== 'undefined' && localStorage.getItem('local_mock_mode') === 'true';
    if (isMock) {
      setUsuarios([{ id: 'mock1', email: 'tecnico.jules@municipio.gov.br', role: 'admin' }]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'usuarios_permitidos'), (snap) => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() } as UsuarioPermitido)));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching usuarios_permitidos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail.trim() || !novoEmail.includes('@')) return;

    try {
      const isMock = typeof window !== 'undefined' && localStorage.getItem('local_mock_mode') === 'true';
      if (!isMock) {
        const id = novoEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'usuarios_permitidos', id), {
          email: novoEmail.trim().toLowerCase(),
          role: 'user'
        });
      }
      setNovoEmail('');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Erro ao adicionar usuário. Você tem permissão?');
    }
  };

  const handleRemove = async (id: string, email: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${email}?`)) return;
    try {
      const isMock = typeof window !== 'undefined' && localStorage.getItem('local_mock_mode') === 'true';
      if (!isMock) {
        await deleteDoc(doc(db, 'usuarios_permitidos', id));
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Erro ao remover usuário.');
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Carregando usuários...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Controle de Acesso</h2>
        <p className="text-sm text-slate-600">
          Gerencie quais contas Google têm permissão para acessar o sistema. Apenas os e-mails listados abaixo poderão fazer login.
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-8 flex gap-3">
        <input
          type="email"
          required
          placeholder="E-mail da conta Google (ex: usuario@gmail.com)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {usuarios.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <UserX className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium text-slate-700 mb-1">Nenhum usuário cadastrado</p>
            <p className="text-sm">Se a lista ficar vazia, qualquer um poderia ser bloqueado. Adicione ao menos um administrador.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {usuarios.map((user) => (
              <li key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(user.id, user.email)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover acesso"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
