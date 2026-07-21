import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CiRecord, ExtratoRecord, ContaBancariaRecord } from '../types';

interface ExtratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  itemToEdit: ExtratoRecord | null;
  ciRecords: CiRecord[];
  contasRecords: ContaBancariaRecord[];
  defaultMode?: 'saida' | 'entrada' | 'transferencia';
}

export function ExtratoModal({ isOpen, onClose, onSave, itemToEdit, ciRecords, contasRecords, defaultMode }: ExtratoModalProps) {
  const [formData, setFormData] = useState<Partial<ExtratoRecord>>({
    tipo: defaultMode || 'saida',
    subTipo: defaultMode === 'saida' ? 'avulso' : defaultMode === 'entrada' ? 'rendimento' : 'transferencia_saida',
    data: new Date().toISOString().split('T')[0],
    contaBancaria: contasRecords.length > 0 ? contasRecords[0].nome : 'BL PSB FNAS - Ag 3972'
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({
        tipo: defaultMode || 'saida',
        subTipo: defaultMode === 'saida' ? 'avulso' : defaultMode === 'entrada' ? 'rendimento' : 'transferencia_saida',
        data: new Date().toISOString().split('T')[0],
        contaBancaria: contasRecords.length > 0 ? contasRecords[0].nome : 'BL PSB FNAS - Ag 3972'
      });
    }
  }, [itemToEdit, isOpen, defaultMode, contasRecords]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ciId = e.target.value;
    const ci = ciRecords.find(c => c.id === ciId);
    if (ci) {
      setFormData(prev => ({
        ...prev,
        refCi: ci.ci,
        descricao: `Pagamento CI: ${ci.resumo}`,
        dotacao: ci.dotacao,
        valor: ci.valorPago || ci.valor
      }));
    } else {
      setFormData(prev => ({ ...prev, refCi: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipo === 'transferencia') {
        // Cria dois registros
        const idBase = itemToEdit?.id || `extrato_${Date.now()}`;
        
        const sentido = formData.subTipo || 'aplicacao'; // 'aplicacao' (CC -> Inv) or 'resgate' (Inv -> CC)
        
        const regSaida = {
            ...formData,
            id: itemToEdit ? itemToEdit.id : `${idBase}_s`,
            tipo: 'saida',
            subConta: sentido === 'aplicacao' ? 'corrente' : 'investimento',
            descricao: sentido === 'aplicacao' ? 'Aplicação Financeira' : 'Resgate de Aplicação',
            valor: Number(formData.valor)
        };
        const regEntrada = {
            ...formData,
            id: itemToEdit ? itemToEdit.id + '_e' : `${idBase}_e`,
            tipo: 'entrada',
            subConta: sentido === 'aplicacao' ? 'investimento' : 'corrente',
            descricao: sentido === 'aplicacao' ? 'Aplicação Recebida' : 'Resgate Recebido',
            valor: Number(formData.valor)
        };
        onSave(regSaida);
        if (!itemToEdit) {
            onSave(regEntrada);
        }
    } else {
        const isInvestimento = formData.subTipo === 'rendimento' || formData.subConta === 'investimento';
        onSave({
            ...formData,
            subConta: isInvestimento ? 'investimento' : 'corrente',
            valor: Number(formData.valor)
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {itemToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden" aria-label="Fechar modal de extrato">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {!itemToEdit && (
                <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Lançamento</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                    <input type="radio" name="tipo" value="saida" checked={formData.tipo === 'saida'} onChange={handleChange} />
                    Saída / Tarifa
                    </label>
                    <label className="flex items-center gap-2">
                    <input type="radio" name="tipo" value="entrada" checked={formData.tipo === 'entrada'} onChange={handleChange} />
                    Nova Entrada
                    </label>
                    <label className="flex items-center gap-2">
                    <input type="radio" name="tipo" value="transferencia" checked={formData.tipo === 'transferencia'} onChange={handleChange} />
                    Transferência
                    </label>
                </div>
                </div>
            )}

            {formData.tipo === 'saida' && (
               <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origem da Saída</label>
                  <select name="subTipo" value={formData.subTipo || 'avulso'} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="avulso">Lançamento Avulso (Tarifa/Outros)</option>
                      <option value="ci">Referenciar CI Existente</option>
                  </select>
               </div>
            )}

            {formData.tipo === 'saida' && formData.subTipo === 'ci' && (
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar CI</label>
                    <select onChange={handleCiChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                        <option value="">Selecione uma CI...</option>
                        {ciRecords.map(ci => (
                            <option key={ci.id} value={ci.id}>{ci.ci} - {ci.resumo}</option>
                        ))}
                    </select>
                </div>
            )}

            {formData.tipo === 'entrada' && (
               <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Entrada</label>
                  <select name="subTipo" value={formData.subTipo || 'rendimento'} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="rendimento">Rendimento de Aplicação</option>
                      <option value="repasse">Repasse Financeiro</option>
                      <option value="avulso">Outras Entradas</option>
                  </select>
               </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input type="date" name="data" value={formData.data || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
              <input type="number" step="0.01" name="valor" value={formData.valor || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>

            {formData.tipo === 'transferencia' ? (
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sentido da Transferência</label>
                    <select name="subTipo" value={formData.subTipo || 'aplicacao'} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                        <option value="aplicacao">Aplicação (Conta Corrente ➔ Investimentos)</option>
                        <option value="resgate">Resgate (Investimentos ➔ Conta Corrente)</option>
                    </select>
                </div>
            ) : null}

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Conta Bancária</label>
                <select name="contaBancaria" value={formData.contaBancaria || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    {contasRecords.map(conta => (
                        <option key={conta.id} value={conta.nome}>{conta.nome}</option>
                    ))}
                </select>
            </div>

            {formData.tipo !== 'transferencia' && (
                <>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <input type="text" name="descricao" value={formData.descricao || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                
                {formData.tipo === 'saida' && formData.subTipo !== 'ci' && (
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dotação / Fonte (Opcional)</label>
                        <input type="text" name="dotacao" value={formData.dotacao || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                )}
                </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-hidden">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden">
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
