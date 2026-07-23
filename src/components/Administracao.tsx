import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { db } from '../lib/firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { AuditLogs } from './AuditLogs';

interface AdministracaoProps {
  logs: any[];
  dbData: any;
}

export function Administracao({ logs, dbData }: AdministracaoProps) {
  const [activeTab, setActiveTab] = useState<'backup' | 'logs'>('backup');
  const [restoring, setRestoring] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const dataStr = JSON.stringify(dbData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_sincronizador_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Atenção! A restauração do banco de dados irá sobrescrever os dados atuais. Deseja continuar?")) {
      event.target.value = '';
      return;
    }

    setRestoring(true);
    setStatus({ type: null, message: '' });

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const batch = writeBatch(db);
      
      const collectionsToRestore = ['aocs', 'ci', 'extrato', 'contas', 'registro_atividades', 'lancamentos_futuros'];

      for (const col of collectionsToRestore) {
        if (Array.isArray(data[col])) {
          data[col].forEach((item: any) => {
            const id = item.id || doc(collection(db, col)).id;
            const docRef = doc(db, col, id);
            batch.set(docRef, item);
          });
        }
      }

      await batch.commit();
      
      setStatus({ type: 'success', message: 'Restauração concluída com sucesso! Recarregue a página para ver os dados.' });
    } catch (error) {
      console.error("Error restoring database:", error);
      setStatus({ type: 'error', message: 'Erro ao restaurar o banco de dados. Verifique se o arquivo JSON é válido.' });
    } finally {
      setRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200">
        <div className="flex px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Backup e Restauração
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Logs de Auditoria
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'backup' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Backup Local</h2>
              <p className="text-sm text-slate-600 mb-4">
                Faça o download de todos os registros atuais do sistema em um arquivo JSON. Isso inclui contratos, CIs, relatórios e outros lançamentos.
              </p>
              <button
                onClick={handleBackup}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-xl text-sm transition-colors"
              >
                <Download className="w-4.5 h-4.5" />
                Fazer Backup dos Dados
              </button>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Restauração de Dados</h2>
              <p className="text-sm text-slate-600 mb-4">
                Faça o upload de um arquivo de backup (.json) para restaurar os registros. 
                <span className="font-semibold text-red-600 ml-1">
                  Atenção: A restauração pode sobrescrever os dados existentes.
                </span>
              </p>
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleRestore}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                  className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl text-sm transition-colors ${
                    restoring 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-4.5 h-4.5" />
                  {restoring ? 'Restaurando...' : 'Selecionar Arquivo de Backup'}
                </button>
              </div>

              {status.type && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  )}
                  {status.message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="-mx-6 -my-6">
            <AuditLogs logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}
