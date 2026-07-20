# Plano de Implementação

Com base nas planilhas, notei a seguinte estrutura e relação:

1. **Informações Base**: É o ponto de partida (Número, Data, Resumo, Empresa, Contrato/ARP, Processo).
2. **Pedidos**: Expande a base, adicionando Valor, Dotação, Fonte, Conta Bancária, Ordem de Compra, Empenho e Status de Entrega. Referencia pelo "Numero" e "Empresa".
3. **Financeiro - AOCS**: Vincula os pedidos à Nota Fiscal (Número e Data), gerando o Número da CI (Comunicação Interna).
4. **Financeiro - CI**: Reúne dados da CI, AOCS, Pedido, Empenho, Empresa, Histórico, Valor e Nota Fiscal. Aqui entram outras despesas (como COPASA, CEMIG) que não têm "Número" base.
5. **Financeiro - Dados Adicionais**: Finaliza o fluxo com Data de Pagamento, Valor Pago, Chave de Acesso da NF e Conferência de Extrato.
6. **Contas Bancárias e Cálculos**: É um relatório gerencial que consolida/soma os valores gastos por cada Conta Bancária (Ex: BL PSB FNAS, IGD BF, Piso Mineiro, Recurso Próprio).

Vou estruturar o sistema em Módulos correspondentes a essas abas, com banco de dados local para que você insira um "Número" e ele puxe automaticamente as informações conectadas (como a Planilha faz com as fórmulas de PROCV/VLOOKUP).
