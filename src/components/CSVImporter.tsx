import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, X, Check, Eye } from 'lucide-react';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function CSVImporter() {
  const { user } = useFirebaseData();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewCollection, setPreviewCollection] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, collectionName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setStatus({ type: 'error', message: 'Você precisa estar logado para importar dados.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: `Lendo arquivo ${file.name}...` });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const headerMap: Record<string, string> = {
          'AOCS': 'aocs',
          'Data AOCS': 'dataAocs',
          'Resumo': 'resumo',
          'Resumo Contratação': 'resumo',
          'Empresa': 'empresa',
          'Fornecedor': 'empresa',
          'Contrato / ARP': 'contratoArp',
          'Contrato/ARP': 'contratoArp',
          'Processo': 'processo',
          'Processo Licitatório': 'processo',
          'Ordem de Compra': 'ordemCompra',
          'Data Envio': 'dataEnvio',
          'Data do Envio': 'dataEnvio',
          'Empenho': 'empenho',
          'Nº Empenho': 'empenho',
          'Valor': 'valor',
          'Entregue': 'entregue',
          'Nota Fiscal': 'notaFiscal',
          'Data NF': 'dataNF',
          'Data Nota Fiscal': 'dataNF',
          'Número CI': 'numeroCI',
          'Número da CI': 'numeroCI',
          'Dotação': 'dotacao',
          'Fonte': 'fonte',
          'Conta Bancaria': 'contaBancaria',
          'Conta Bancária': 'contaBancaria',
          'Conta': 'contaBancaria',
          
          'CI': 'ci',
          'Data CI': 'dataCI',
          'Data': 'dataCI',
          'Data Pagamento': 'dataPagamento',
          'Data de Pagamento': 'dataPagamento',
          'Valor Pago': 'valorPago',
          'Chave de Acesso NF': 'chaveAcessoNF',
          'Chave de Acesso': 'chaveAcessoNF',
          'Conferencia Extrato': 'conferenciaExtrato',
          'Conferência Extrato': 'conferenciaExtrato'
        };

        const processedData = data.map((row: any) => {
          let processedRow: any = {};
          
          // Map headers and sanitize values
          Object.keys(row).forEach(key => {
            const mappedKey = headerMap[key.trim()] || key.trim();
            let value = row[key];
            
            // Handle null/undefined
            if (value === null || value === undefined) {
              value = '';
            }
            
            processedRow[mappedKey] = value;
          });

          // Core value casting & defaults
          if (collectionName === 'aocs') {
            processedRow.aocs = String(processedRow.aocs || '').trim();
            processedRow.dataAocs = String(processedRow.dataAocs || '').trim();
            processedRow.resumo = String(processedRow.resumo || '').trim();
            processedRow.empresa = String(processedRow.empresa || '').trim();
            
            // Coerce Valor
            let rawVal = processedRow.valor;
            if (typeof rawVal === 'string') {
              rawVal = parseFloat(rawVal.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
            }
            processedRow.valor = isNaN(Number(rawVal)) ? 0 : Number(rawVal);
          } else if (collectionName === 'ci') {
            processedRow.ci = String(processedRow.ci || '').trim();
            processedRow.dataCI = String(processedRow.dataCI || '').trim();
            processedRow.aocs = String(processedRow.aocs || '-').trim();
            processedRow.empresa = String(processedRow.empresa || '').trim();
            processedRow.resumo = String(processedRow.resumo || '').trim();

            // Coerce Valor
            let rawVal = processedRow.valor;
            if (typeof rawVal === 'string') {
              rawVal = parseFloat(rawVal.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
            }
            processedRow.valor = isNaN(Number(rawVal)) ? 0 : Number(rawVal);

            // Coerce Valor Pago
            let rawValPago = processedRow.valorPago;
            if (typeof rawValPago === 'string') {
              rawValPago = parseFloat(rawValPago.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
            }
            processedRow.valorPago = isNaN(Number(rawValPago)) ? 0 : Number(rawValPago);
          }

          return processedRow;
        });

        setPreviewData(processedData);
        setPreviewCollection(collectionName);
        setStatus({ type: 'info', message: `Pré-visualização gerada para ${processedData.length} registros.` });
      } catch (error: any) {
        console.error('File read error:', error);
        setStatus({ type: 'error', message: `Erro ao ler arquivo: ${error.message}` });
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Erro ao tentar ler o arquivo.' });
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    if (!previewData || !previewCollection) return;
    setLoading(true);
    setStatus({ type: 'info', message: `Importando ${previewData.length} registros para "${previewCollection}"...` });

    try {
      const batch = writeBatch(db);
      let count = 0;

      previewData.forEach((row) => {
        const id = `${previewCollection}_import_${Date.now()}_${count++}`;
        const docRef = doc(db, previewCollection, id);
        batch.set(docRef, { ...row, id });
      });

      await batch.commit();
      setStatus({ type: 'success', message: `${previewData.length} registros importados com sucesso para ${previewCollection}!` });
      setPreviewData(null);
      setPreviewCollection(null);
    } catch (error: any) {
      console.error('Import error:', error);
      setStatus({ type: 'error', message: `Erro ao importar: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const cancelImport = () => {
    setPreviewData(null);
    setPreviewCollection(null);
    setStatus(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Importação de Planilhas</h2>
          <p className="text-sm text-slate-500">Alimente o banco de dados enviando seus arquivos Excel (.xls, .xlsx) ou CSV.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
          status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
          'bg-blue-50 text-blue-700 border border-blue-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p>{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImportCard title="1. AOCS" collection="aocs" disabled={loading || !!previewData} onUpload={handleFileUpload} />
        <ImportCard title="2. CI" collection="ci" disabled={loading || !!previewData} onUpload={handleFileUpload} />
      </div>

      {previewData && (
        <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Eye className="w-5 h-5 text-indigo-600" />
              Pré-visualização: {previewCollection} ({previewData.length} linhas)
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={cancelImport}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button 
                onClick={confirmImport}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> Confirmar Importação
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  {Object.keys(previewData[0] || {}).map(key => (
                    <th key={key} className="px-4 py-2 font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {previewData.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.keys(previewData[0] || {}).map(key => (
                      <td key={key} className="px-4 py-2 text-slate-600 whitespace-nowrap truncate max-w-[200px]" title={String(row[key])}>
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length > 50 && (
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 text-center">
              Mostrando os primeiros 50 registros de {previewData.length}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImportCard({ title, collection, disabled, onUpload }: { title: string, collection: string, disabled: boolean, onUpload: (e: React.ChangeEvent<HTMLInputElement>, col: string) => void }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center hover:border-indigo-300 transition-colors bg-slate-50 relative overflow-hidden group">
      <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
      <label className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span>Selecionar Arquivo</span>
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => onUpload(e, collection)}
        />
      </label>
    </div>
  );
}
