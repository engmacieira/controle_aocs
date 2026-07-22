/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AocsRecord {
  id: string;
  aocs: string;
  dataAocs: string;
  resumo: string;
  empresa: string;
  contratoArp: string;
  processo: string;
  ordemCompra: string;
  dataEnvio: string;
  empenho: string;
  valor: number;
  entregue: string;
  notaFiscal: string;
  dataNF: string;
  numeroCI: string;
  dotacao: string;
  fonte: string;
  contaBancaria: string;
}

export interface CiRecord {
  id: string;
  ci: string;
  dataCI: string;
  aocs: string;
  ordemCompra: string;
  empenho: string;
  empresa: string;
  resumo: string;
  valor: number;
  notaFiscal: string;
  dataNF: string;
  dotacao: string;
  fonte: string;
  contaBancaria: string;
  dataPagamento: string;
  valorPago: number;
  chaveAcessoNF: string;
  conferenciaExtrato: string;
  status?: 'Pendente' | 'Pago' | 'Atrasado';
}

export interface ExtratoRecord {
  id: string;
  data: string;
  refCi: string;
  descricao: string;
  dotacao: string;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  conciliado: boolean;
  contaBancaria: string;
  subConta?: 'corrente' | 'investimento';
  subTipo?: string; // 'avulso', 'ci', 'rendimento', 'repasse'
}

export interface ContaResumo {
  conta: string;
  totalAocs: number;
  totalCi: number;
  totalPago: number;
}

export interface ContaBancariaRecord {
  id: string;
  nome: string;
}

export interface LancamentoFuturo {
  id: string;
  conta_id: string;
  descricao: string;
  valor: number;
  data_prevista: string;
  recorrente: boolean;
  status: 'ATIVO' | 'CANCELADO';
  created_at: string;
  tipo_categoria?: string;
  tipo_lancamento: 'entrada' | 'saida';
}

export type SortOrder = 'asc' | 'desc';

export interface RegistroAtividadeRecord {
  id: string;
  titulo_atividade: string;
  resumo: string;
  data_inicio: string; // YYYY-MM-DD
  data_fim: string; // YYYY-MM-DD
  tecnico_responsavel: string;
  aocs_ci_vinculada?: string;
  relato_detalhado: string;
  link_drive_midias: string;
  created_at: any; // Timestamp or number
}
