/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { 
  AocsRecord, 
  CiRecord,
  ContaBancariaRecord
} from '../types';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'aocs' | 'pedidos' | 'faturamento' | 'ci' | 'relatorio' | 'espelho';
  itemToEdit: any | null; // Can be any of the records
  onSave: (item: any) => void;
  
  aocsRecords: AocsRecord[];
  ciRecords: CiRecord[];
  contasRecords: ContaBancariaRecord[];
}

export function FormModal({
  isOpen,
  onClose,
  activeTab,
  itemToEdit,
  onSave,
  aocsRecords,
  ciRecords,
  contasRecords
}: FormModalProps) {
  // Form values state
  const [formData, setFormData] = React.useState<any>({});
  const [vlookupNotice, setVlookupNotice] = React.useState<string>('');

  // Initialize form with item to edit or defaults
  React.useEffect(() => {
    if (itemToEdit) {
      setFormData({ ...itemToEdit });
    } else {
      // Default empty values based on active tab
      if (activeTab === 'aocs') {
        setFormData({
          aocs: '',
          dataAocs: '',
          resumo: '',
          empresa: '',
          contratoArp: '',
          processo: '',
          ordemCompra: '',
          dataEnvio: '',
          empenho: '',
          valor: 0,
          entregue: 'EM ANDAMENTO',
          notaFiscal: '',
          dataNF: '',
          numeroCI: '',
          dotacao: '',
          fonte: '',
          contaBancaria: ''
        });
      } else if (activeTab === 'pedidos') {
        setFormData({
          id: '',
          aocs: '',
          empresa: '',
          ordemCompra: '',
          dataEnvio: '',
          empenho: '',
          dotacao: '',
          fonte: '',
          contaBancaria: ''
        });
      } else if (activeTab === 'faturamento') {
        setFormData({
          id: '',
          aocs: '',
          empresa: '',
          notaFiscal: '',
          dataNF: '',
          numeroCI: ''
        });
      } else if (activeTab === 'ci') {
        setFormData({
          ci: '',
          dataCI: '',
          aocs: '-',
          ordemCompra: '',
          empenho: '-',
          empresa: '',
          resumo: '',
          valor: 0,
          notaFiscal: '-',
          dataNF: '-',
          dotacao: '-',
          fonte: '',
          contaBancaria: '',
          dataPagamento: '',
          valorPago: 0,
          chaveAcessoNF: '',
          conferenciaExtrato: 'Pendente'
        });
      }
    }
    setVlookupNotice('');
  }, [itemToEdit, activeTab, isOpen]);

  if (!isOpen) return null;

  // Real-time lookup logic (VLOOKUP / PROCV)
  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setVlookupNotice('');

    // VLOOKUP: CI refers AOCS
    if (activeTab === 'ci' && field === 'aocs' && value !== '-') {
      const aocsRecord = aocsRecords.find(a => a.id === value || a.aocs === value);
      if (aocsRecord) {
        updated.ordemCompra = aocsRecord.ordemCompra || '';
        updated.empresa = aocsRecord.empresa || '';
        updated.valor = aocsRecord.valor || 0;
        updated.notaFiscal = aocsRecord.notaFiscal || '';
        updated.dataNF = aocsRecord.dataNF || '';
        updated.dotacao = aocsRecord.dotacao || '';
        updated.fonte = aocsRecord.fonte || '';
        updated.contaBancaria = aocsRecord.contaBancaria || '';
        updated.empenho = aocsRecord.empenho || '';
        updated.resumo = aocsRecord.resumo || '';
        setVlookupNotice('PROCV: Dados herdados do AOCS!');
      }
    }

    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const title = itemToEdit ? 'Editar Registro' : 'Novo Registro';
  const getTabLabel = () => {
    switch (activeTab) {
      case 'aocs': return 'AOCS (Contratação)';
      case 'pedidos': return 'Pedidos de Compra (Vincular AOCS)';
      case 'faturamento': return 'Faturamento AOCS (Vincular NF/CI)';
      case 'ci': return 'Financeiro - CI';
      default: return '';
    }
  };

  return (
    <div id="form-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div id="form-modal-container" className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-lg overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Preenchendo aba: <span className="font-semibold text-indigo-600">{getTabLabel()}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden" aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Smart PROCV notification */}
          {vlookupNotice && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 text-xs text-indigo-800 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>{vlookupNotice}</span>
            </div>
          )}

          {/* 1. TELA AOCS CORE (activeTab === 'aocs') */}
          {activeTab === 'aocs' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Número AOCS *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1"
                  value={formData.aocs || ''}
                  onChange={(e) => handleFieldChange('aocs', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data AOCS *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 01/07/2026"
                  value={formData.dataAocs || ''}
                  onChange={(e) => handleFieldChange('dataAocs', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Resumo Contratação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gênero Alimentício SCFV"
                  value={formData.resumo || ''}
                  onChange={(e) => handleFieldChange('resumo', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fornecedor *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do fornecedor / Empresa"
                  value={formData.empresa || ''}
                  onChange={(e) => handleFieldChange('empresa', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contrato / ARP</label>
                <input
                  type="text"
                  placeholder="Ex: ARP n° 022/2025"
                  value={formData.contratoArp || ''}
                  onChange={(e) => handleFieldChange('contratoArp', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Processo Licitatório</label>
                <input
                  type="text"
                  placeholder="Ex: Pregão Eletrônico n° 015/2025"
                  value={formData.processo || ''}
                  onChange={(e) => handleFieldChange('processo', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Valor Contratado (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor || 0}
                  onChange={(e) => handleFieldChange('valor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
            </div>
          )}

          {/* 2. TELA PEDIDOS DE COMPRA (activeTab === 'pedidos') */}
          {activeTab === 'pedidos' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Vincular AOCS *</label>
                <select
                  value={formData.id || ''}
                  required
                  disabled={!!itemToEdit}
                  onChange={(e) => {
                    const selected = aocsRecords.find(a => a.id === e.target.value);
                    if (selected) {
                      setFormData({
                        ...selected // Load full selected AOCS structure so we edit it directly
                      });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
                >
                  <option value="">Selecione uma AOCS para vincular...</option>
                  {aocsRecords.map(a => (
                    <option key={a.id} value={a.id}>
                      AOCS #{a.aocs} - {a.empresa} (Valor: {a.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </option>
                  ))}
                </select>
                {itemToEdit && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    O vínculo de AOCS não pode ser alterado após a criação.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Ordem de Compra</label>
                <input
                  type="text"
                  placeholder="Ex: 38"
                  value={formData.ordemCompra || ''}
                  onChange={(e) => handleFieldChange('ordemCompra', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data do Envio</label>
                <input
                  type="text"
                  placeholder="Ex: 27-jan."
                  value={formData.dataEnvio || ''}
                  onChange={(e) => handleFieldChange('dataEnvio', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nº Empenho</label>
                <input
                  type="text"
                  placeholder="Ex: 182"
                  value={formData.empenho || ''}
                  onChange={(e) => handleFieldChange('empenho', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Dotação</label>
                <input
                  type="text"
                  placeholder="Ex: Dotação 234"
                  value={formData.dotacao || ''}
                  onChange={(e) => handleFieldChange('dotacao', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fonte</label>
                <input
                  type="text"
                  placeholder="Ex: FR 1.660.000"
                  value={formData.fonte || ''}
                  onChange={(e) => handleFieldChange('fonte', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Conta Bancária</label>
                <select
                  value={formData.contaBancaria || ''}
                  onChange={(e) => handleFieldChange('contaBancaria', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                >
                  <option value="">Selecione uma conta...</option>
                  {contasRecords.map(conta => (
                    <option key={conta.id} value={conta.nome}>{conta.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 3. TELA FATURAMENTO/NOTA FISCAL AOCS (activeTab === 'faturamento') */}
          {activeTab === 'faturamento' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Vincular AOCS *</label>
                <select
                  value={formData.id || ''}
                  required
                  disabled={!!itemToEdit}
                  onChange={(e) => {
                    const selected = aocsRecords.find(a => a.id === e.target.value);
                    if (selected) {
                      setFormData({
                        ...selected // Load full selected AOCS structure so we edit it directly
                      });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
                >
                  <option value="">Selecione uma AOCS para vincular...</option>
                  {aocsRecords.map(a => (
                    <option key={a.id} value={a.id}>
                      AOCS #{a.aocs} - {a.empresa} (Valor: {a.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </option>
                  ))}
                </select>
                {itemToEdit && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    O vínculo de AOCS não pode ser alterado após a criação.
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nota Fiscal</label>
                <input
                  type="text"
                  placeholder="Ex: 1377"
                  value={formData.notaFiscal || ''}
                  onChange={(e) => handleFieldChange('notaFiscal', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data Nota Fiscal</label>
                <input
                  type="text"
                  placeholder="Ex: 28/01"
                  value={formData.dataNF || ''}
                  onChange={(e) => handleFieldChange('dataNF', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Número CI</label>
                <input
                  type="text"
                  placeholder="Ex: 20"
                  value={formData.numeroCI || ''}
                  onChange={(e) => handleFieldChange('numeroCI', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
            </div>
          )}

          {/* 4. TELA FINANCEIRO CI (activeTab === 'ci') */}
          {activeTab === 'ci' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Número CI *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 20"
                  value={formData.ci || ''}
                  onChange={(e) => handleFieldChange('ci', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data CI *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 28/01"
                  value={formData.dataCI || ''}
                  onChange={(e) => handleFieldChange('dataCI', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">AOCS Relacionada</label>
                <select
                  value={formData.aocs || '-'}
                  onChange={(e) => handleFieldChange('aocs', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
                >
                  <option value="-">Avulsa (Nenhuma / Lançamento Direto)</option>
                  {aocsRecords.map(a => (
                    <option key={a.id} value={a.aocs}>
                      AOCS {a.aocs} - {a.empresa.substring(0, 30)}... (R$ {a.valor.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Selecione uma AOCS para herdar automaticamente: Ordem Compra, Empenho, Empresa, Resumo, Valor, Nota Fiscal, Dotação, Fonte e Conta Bancária.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Ordem de Compra</label>
                <input
                  type="text"
                  value={formData.ordemCompra || ''}
                  onChange={(e) => handleFieldChange('ordemCompra', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nº Empenho</label>
                <input
                  type="text"
                  value={formData.empenho || ''}
                  onChange={(e) => handleFieldChange('empenho', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Empresa / Beneficiário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: COPASA ou AILTON ADMILSON"
                  value={formData.empresa || ''}
                  onChange={(e) => handleFieldChange('empresa', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-600 font-semibold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Resumo / Objeto</label>
                <input
                  type="text"
                  placeholder="Ex: CONSUMO AGUA DEZEMBRO"
                  value={formData.resumo || ''}
                  onChange={(e) => handleFieldChange('resumo', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Valor Proposto (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor || 0}
                  onChange={(e) => handleFieldChange('valor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nota Fiscal</label>
                <input
                  type="text"
                  value={formData.notaFiscal || ''}
                  onChange={(e) => handleFieldChange('notaFiscal', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Dotação</label>
                <input
                  type="text"
                  value={formData.dotacao || ''}
                  onChange={(e) => handleFieldChange('dotacao', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fonte</label>
                <input
                  type="text"
                  value={formData.fonte || ''}
                  onChange={(e) => handleFieldChange('fonte', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Conta Bancária</label>
                <select
                  value={formData.contaBancaria || ''}
                  onChange={(e) => handleFieldChange('contaBancaria', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-slate-50 text-slate-500"
                >
                  <option value="">Selecione uma conta...</option>
                  {contasRecords.map(conta => (
                    <option key={conta.id} value={conta.nome}>{conta.nome}</option>
                  ))}
                </select>
              </div>

              {/* Data Pagamento, Valor Pago, Chave de Acesso, Conferência Extrato */}
              <div className="col-span-2 border-t border-dashed border-slate-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>
                  Informações de Liquidação & Pagamento
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Data de Pagamento</label>
                <input
                  type="text"
                  placeholder="Ex: 02/02"
                  value={formData.dataPagamento || ''}
                  onChange={(e) => handleFieldChange('dataPagamento', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Valor Pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorPago || 0}
                  onChange={(e) => handleFieldChange('valorPago', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm font-bold text-emerald-700"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status do Pagamento</label>
                <select
                  value={formData.status || 'Pendente'}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Dispensado">Dispensado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Chave de Acesso</label>
                <input
                  type="text"
                  placeholder="Chave de acesso da NF"
                  value={formData.chaveAcessoNF || ''}
                  onChange={(e) => handleFieldChange('chaveAcessoNF', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Conferência Extrato</label>
                <select
                  value={formData.conferenciaExtrato || 'Pendente'}
                  onChange={(e) => handleFieldChange('conferenciaExtrato', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Dispensado">Dispensado</option>
                </select>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg outline-hidden"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
            >
              Salvar Registro
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
