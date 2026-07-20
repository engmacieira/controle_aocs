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
}

export interface ContaResumo {
  conta: string;
  totalAocs: number;
  totalCi: number;
  totalPago: number;
}

export type SortOrder = 'asc' | 'desc';


