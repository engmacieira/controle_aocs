import React from 'react';
import { X } from 'lucide-react';
import { LancamentoFuturo, ContaBancariaRecord } from '../types';

interface ModalLancamentoFuturoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  itemToEdit: LancamentoFuturo | null;
  contasRecords: ContaBancariaRecord[];
  initialConta?: string;
}

export function ModalLancamentoFuturo({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  contasRecords,
  initialConta
}: ModalLancamentoFuturoProps) {
  const [formData, setFormData] = React.useState<Partial<LancamentoFuturo>>({});

  React.useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({
        conta_id: initialConta || (contasRecords[0]?.nome || ''),
        descricao: '',
        valor: 0,
        data_prevista: new Date().toISOString().split('T')[0],
        recorrente: false,
        status: 'ATIVO',
        tipo_categoria: '',
        tipo_lancamento: 'saida'
      });
    }
  }, [itemToEdit, isOpen, initialConta, contasRecords]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof LancamentoFuturo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.conta_id || !formData.descricao || formData.valor === undefined || !formData.data_prevista || !formData.tipo_lancamento) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const finalData = {
      ...formData,
      created_at: formData.created_at || new Date().toISOString()
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-md overflow-hidden my-8 animate-scale-up">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-lg">
            {itemToEdit ? 'Editar Lançamento Futuro' : 'Novo Lançamento Futuro'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => handleFieldChange('tipo_lancamento', 'saida')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors outline-hidden ${
                formData.tipo_lancamento === 'saida'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${formData.tipo_lancamento === 'saida' ? 'bg-rose-500' : 'bg-slate-300'}`} />
              Saída (Débito)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('tipo_lancamento', 'entrada')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors outline-hidden ${
                formData.tipo_lancamento === 'entrada'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${formData.tipo_lancamento === 'entrada' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              Entrada (Crédito)
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Conta Bancária *</label>
            <select
              value={formData.conta_id || ''}
              onChange={(e) => handleFieldChange('conta_id', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden bg-white"
              required
            >
              <option value="">Selecione uma conta...</option>
              {contasRecords.map(conta => (
                <option key={conta.id} value={conta.nome}>{conta.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Descrição *</label>
            <input
              type="text"
              required
              placeholder="Ex: Contratação Recorrente de TI"
              value={formData.descricao || ''}
              onChange={(e) => handleFieldChange('descricao', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Categoria / Tipo</label>
              <input
                type="text"
                placeholder="Ex: Serviços"
                value={formData.tipo_categoria || ''}
                onChange={(e) => handleFieldChange('tipo_categoria', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Valor Previsto (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.valor || ''}
                onChange={(e) => handleFieldChange('valor', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data Prevista *</label>
            <input
              type="date"
              required
              value={formData.data_prevista || ''}
              onChange={(e) => handleFieldChange('data_prevista', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="recorrente"
              checked={formData.recorrente || false}
              onChange={(e) => handleFieldChange('recorrente', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="recorrente" className="text-sm font-medium text-slate-700 cursor-pointer">
              Recorrente Mensal
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors outline-hidden rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
