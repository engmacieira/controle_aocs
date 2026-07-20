/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AocsRecord, CiRecord } from './types';

// --- INITIAL DATA: FINANCEIRO AOCS ---
export const INITIAL_AOCS_RECORDS: AocsRecord[] = [
  {
    id: 'a1',
    aocs: '1',
    dataAocs: '1/7/2026',
    resumo: 'Genero Alimenticio SCFV',
    processo: 'Pregão Eletrônico n° 015/2025',
    contratoArp: 'ARP n° 022/2025',
    dataEnvio: '27-jan.',
    empenho: '182',
    entregue: 'ENTREGUE',
    empresa: 'AILTON ADMILSON DA SILVA - ME',
    ordemCompra: '38',
    valor: 963.38,
    notaFiscal: '1377',
    dataNF: '28/01',
    numeroCI: '20',
    dotacao: 'Dotação 234',
    fonte: 'FR 1.660.000',
    contaBancaria: 'BL PSB FNAS - Agencia 3972 - Conta 383783'
  },
  {
    id: 'a2',
    aocs: '2',
    dataAocs: '1/2/2026',
    resumo: 'Locação de Brinquedo',
    processo: 'Pregão Eletrônico n° 058/2025',
    contratoArp: 'ARP n° 075/2025',
    dataEnvio: '',
    empenho: '186',
    entregue: 'ENTREGUE',
    empresa: '28.920.658 BRAINER SIMAN PINTO',
    ordemCompra: '',
    valor: 2762.00,
    notaFiscal: '17',
    dataNF: '03/02',
    numeroCI: '13',
    dotacao: 'Dotação 312',
    fonte: 'FR 1.501.000',
    contaBancaria: 'Fundos da Infância e Adolescência - FIA - Agencia 397-2 - Conta 36.228-X'
  },
  {
    id: 'a3',
    aocs: '3',
    dataAocs: '1/30/2026',
    resumo: 'Plotagem de Veiculo',
    processo: 'Pregão Eletrônico nº 040/2025',
    contratoArp: 'ARP nº 045/2025',
    dataEnvio: '25-fev.',
    empenho: '504',
    entregue: 'ENTREGUE',
    empresa: 'RICA TECH SERVIÇOS DIGITAIS LTDA',
    ordemCompra: '237',
    valor: 44.11,
    notaFiscal: '87',
    dataNF: '01/04',
    numeroCI: '59',
    dotacao: 'Dotação 353',
    fonte: 'FR 1.660.000',
    contaBancaria: 'IGD BF - Agencia 397-2 - Conta 383627'
  }
];

// --- INITIAL DATA: FINANCEIRO CI ---
export const INITIAL_CI_RECORDS: CiRecord[] = [
  {
    id: 'c_i1',
    ci: '1',
    dataCI: '5-jan.',
    aocs: '-',
    ordemCompra: '-',
    empenho: '-',
    empresa: 'COPASA',
    resumo: 'COPASA',
    valor: 66.97,
    notaFiscal: '-',
    dataNF: '-',
    dotacao: '-',
    fonte: 'FR 1.500.000',
    contaBancaria: 'Recurso Próprio',
    dataPagamento: '02/02',
    valorPago: 66.97,
    chaveAcessoNF: '',
    conferenciaExtrato: 'Pendente'
  },
  {
    id: 'c_i20',
    ci: '20',
    dataCI: '28/01',
    aocs: '1',
    ordemCompra: '38',
    empenho: '182',
    empresa: 'AILTON ADMILSON DA SILVA - ME',
    resumo: 'Genero Alimenticio SCFV',
    valor: 963.38,
    notaFiscal: '1377',
    dataNF: '28/01',
    dotacao: 'Dotação 234',
    fonte: 'FR 1.660.000',
    contaBancaria: 'BL PSB FNAS - Agencia 3972 - Conta 383783',
    dataPagamento: '',
    valorPago: 0,
    chaveAcessoNF: '',
    conferenciaExtrato: 'Pendente'
  },
  {
    id: 'c_i13',
    ci: '13',
    dataCI: '03/02',
    aocs: '2',
    ordemCompra: '',
    empenho: '186',
    empresa: '28.920.658 BRAINER SIMAN PINTO',
    resumo: 'Locação de Brinquedo',
    valor: 2762.00,
    notaFiscal: '17',
    dataNF: '03/02',
    dotacao: 'Dotação 312',
    fonte: 'FR 1.501.000',
    contaBancaria: 'Fundos da Infância e Adolescência - FIA - Agencia 397-2 - Conta 36.228-X',
    dataPagamento: '',
    valorPago: 0,
    chaveAcessoNF: '',
    conferenciaExtrato: 'Pendente'
  }
];
