# Guia de Testes Automatizados - LicitaDocs (Gerenciador de AOCS/CIs)

Este documento contém as instruções necessárias para instalar as dependências de teste, executar a suíte de testes com o **Vitest** e **React Testing Library**, e gerar relatórios de cobertura (coverage).

---

## 🚀 Como Executar os Testes

Para rodar os testes, siga os passos abaixo no terminal do projeto frontend.

### 1. Instalar as Dependências de Testes
Caso ainda não tenha instalado as dependências de desenvolvimento do projeto:
```bash
npm install
```

### 2. Executar a Suíte de Testes (Modo Único)
Para rodar todos os testes unitários e de integração de uma vez e gerar o sumário de sucesso no terminal:
```bash
npm run test
```

### 3. Executar os Testes em Modo Interativo (Watch Mode)
Para manter o Vitest rodando e re-executar os testes automaticamente a cada alteração de código:
```bash
npm run test:watch
```

### 4. Gerar Relatório de Cobertura de Código (Coverage)
Para rodar a suíte coletando estatísticas detalhadas de quais linhas e ramificações (branches) do código foram testadas:
```bash
npm run test:coverage
```
Isso gerará os resultados diretamente no terminal e também criará uma pasta interativa `coverage/index.html` que pode ser aberta no navegador para exploração visual detalhada.

---

## 🛠️ Estrutura da Suíte de Testes

Os testes e mocks foram criados e estruturados seguindo as melhores práticas modernas de desenvolvimento para manter o isolamento e robustez:

1. **Setup Global (`src/test/setup.ts`)**:
   - Configura as extensões do `@testing-library/jest-dom`.
   - Limpa automaticamente a árvore do DOM após a execução de cada teste (`afterEach(cleanup)`).
   - Reseta os mocks do Vitest para evitar vazamento de estados entre os arquivos de testes.

2. **Mocks de Produção (`src/test/mocks/firebase.ts`)**:
   - Cria mocks do Firebase Auth (estados de login, popup do Google) e Firestore (`collection`, `doc`, `onSnapshot`, `setDoc`, `deleteDoc`).
   - Evita conexões de rede ou modificações de dados reais do Firebase de produção durante os testes.

3. **Testes Unitários de Componentes**:
   - **`src/components/AocsTable.test.tsx`**: Valida a listagem de registros, a filtragem textual em tempo real, a ordenação de colunas, exclusão em lote e ações como adicionar ou editar.
   - **`src/components/FormModal.test.tsx`**: Valida o preenchimento de formulários e a funcionalidade de **PROCV/VLOOKUP** em tempo real quando a aba `ci` é selecionada e uma AOCS é vinculada.
   - **`src/components/CSVImporter.test.tsx`**: Valida o carregamento e leitura de arquivos `.xlsx` / `.csv`, o mapeamento de cabeçalhos e a renderização de pré-visualizações ricas de tabelas.

4. **Testes de Integração do Hook**:
   - **`src/hooks/useFirebaseData.test.ts`**: Valida o comportamento do hook em relação a estados reativos de autenticação, carregamento de dados em tempo real através do listener de `onSnapshot` e as operações de salvamento e exclusão de registros de forma isolada.
