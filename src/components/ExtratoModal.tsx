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
    subTipo: defaultMode === 'saida' ? 'avulso' : defaultMode === 'entrada' ? 'rendimento' : 'aplicacao',
    data: new Date().toISOString().split('T')[0],
    contaBancaria: contasRecords.length > 0 ? contasRecords[0].nome : 'BL PSB FNAS - Ag 3972'
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({
        tipo: defaultMode || 'saida',
        subTipo: defaultMode === 'saida' ? 'avulso' : defaultMode === 'entrada' ? 'rendimento' : 'aplicacao',
        data: new Date().toISOString().split('T')[0],
        contaBancaria: contasRecords.length > 0 ? contasRecords[0].nome : 'BL PSB FNAS - Ag 3972'
      });
    }
  }, [itemToEdit, isOpen, defaultMode, contasRecords]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updates: any = { [name]: value };
      if (name === 'tipo') {
        if (value === 'saida') updates.subTipo = 'avulso';
        else if (value === 'entrada') updates.subTipo = 'rendimento';
        else if (value === 'transferencia') updates.subTipo = 'aplicacao';
      }
      return { ...prev, ...updates };
    });
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            {itemToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden" aria-label="Fechar modal de extrato">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {!itemToEdit && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Lançamento</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="tipo" value="saida" checked={formData.tipo === 'saida'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Saída / Tarifa</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="tipo" value="entrada" checked={formData.tipo === 'entrada'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Nova Entrada</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="tipo" value="transferencia" checked={formData.tipo === 'transferencia'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Transferência</span>
                  </label>
                </div>
              </div>
            )}

            {formData.tipo === 'saida' && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Origem da Saída</label>
                <select name="subTipo" value={formData.subTipo || 'avulso'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm">
                  <option value="avulso">Lançamento Avulso (Tarifa/Outros)</option>
                  <option value="ci">Referenciar CI Existente</option>
                </select>
              </div>
            )}

            {formData.tipo === 'saida' && formData.subTipo === 'ci' && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Selecionar CI</label>
                <select onChange={handleCiChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm">
                  <option value="">Selecione uma CI...</option>
                  {ciRecords.map(ci => (
                    <option key={ci.id} value={ci.id}>{ci.ci} - {ci.resumo}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.tipo === 'entrada' && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Entrada</label>
                <select name="subTipo" value={formData.subTipo || 'rendimento'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm">
                  <option value="rendimento">Rendimento de Aplicação</option>
                  <option value="repasse">Repasse Financeiro</option>
                  <option value="avulso">Outras Entradas</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
              <input type="date" name="data" value={formData.data || ''} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Valor</label>
              <input type="number" step="0.01" name="valor" value={formData.valor || ''} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm" />
            </div>

            {formData.tipo === 'transferencia' ? (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sentido da Transferência</label>
                <select name="subTipo" value={formData.subTipo || 'aplicacao'} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm">
                  <option value="aplicacao">Aplicação (Conta Corrente ➔ Investimentos)</option>
                  <option value="resgate">Resgate (Investimentos ➔ Conta Corrente)</option>
                </select>
              </div>
            ) : null}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Conta Bancária</label>
              <select name="contaBancaria" value={formData.contaBancaria || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm">
                {contasRecords.map(conta => (
                  <option key={conta.id} value={conta.nome}>{conta.nome}</option>
                ))}
              </select>
            </div>

            {formData.tipo !== 'transferencia' && (
              <>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                  <input type="text" name="descricao" value={formData.descricao || ''} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm" />
                </div>

                {formData.tipo === 'saida' && formData.subTipo !== 'ci' && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Dotação / Fonte (Opcional)</label>
                    <input type="text" name="dotacao" value={formData.dotacao || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all sm:text-sm" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 outline-hidden">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden">
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
