# Codebase Guide

Este guia descreve responsabilidades de cada modulo e os pontos de extensao mais importantes do projeto.

## 1) Visao geral arquitetural

- Arquitetura: client-side com App Router (sem backend proprio)
- Estado global: React Context + `useReducer`
- Persistencia: `localStorage` (somente array de despesas)
- Derivacoes: funcoes puras em `src/lib` para analytics, formatacao e CSV

## 2) Estado e dominio

### `src/types/expense.ts`

Define contratos centrais:
- `Category`
- `Expense`
- `FilterState`
- `AppState`

Tambem centraliza:
- Lista canonica de categorias (`CATEGORIES`)
- Configuracoes visuais por categoria (`CATEGORY_COLORS`, `CATEGORY_BG`)
- Filtros padrao (`DEFAULT_FILTERS`)

### `src/context/ExpenseContext.tsx`

Responsavel por:
- Inicializar estado da aplicacao
- Reducer com acoes CRUD e filtros
- Hidratar despesas do `localStorage`
- Persistir alteracoes
- Expor hook `useExpenses()`

Observacao: o campo `hydrated` evita flashes de UI incorreta antes da leitura do storage.

## 3) Utilitarios puros

### `src/lib/format.ts`

- `formatCurrency`: centavos -> USD
- `centsToDisplay`: centavos -> string decimal
- `displayToCents`: string decimal -> centavos
- `formatDate`: `YYYY-MM-DD` -> data legivel

### `src/lib/analytics.ts`

- `getCategoryTotals`: soma por categoria
- `getThisMonthTotal`: total por ano-mes
- `getTopCategory`: categoria com maior gasto
- `getMonthlyTotals`: janela movel de 6 meses para grafico

### `src/lib/csv.ts`

- `generateCSV`: serializacao com escape correto
- `downloadCSV`: download no navegador via Blob + object URL

## 4) Rotas e telas

### `src/app/layout.tsx`

Shell global:
- Fonte
- Provider global
- Navbar
- area de conteudo com espaco para barra mobile fixa

### `src/app/page.tsx` (Dashboard)

- KPIs (total geral, mes atual, top categoria)
- Grafico pizza por categoria
- Grafico de barras por mes
- Lista de despesas recentes
- Estado vazio orientado para primeira acao

### `src/app/expenses/page.tsx`

- Filtros por texto/data/categoria
- Contagem e soma do subconjunto filtrado
- Exportacao CSV do que esta sendo exibido
- Lista responsiva de despesas

### `src/app/expenses/new/page.tsx`

Wrapper visual do formulario de cadastro.

### `src/app/expenses/[id]/edit/page.tsx`

- Resolve `id` da rota
- Espera hidratacao do estado
- Mostra fallback se despesa nao existir
- Reusa `ExpenseForm` no modo edicao

## 5) Componentes

### Formularios e itens

- `src/components/ExpenseForm.tsx`
  - Validacao local
  - Conversoes moeda <-> centavos
  - Fluxo create/edit
  - Feedback com toast

- `src/components/ExpenseRow.tsx`
  - Render desktop + mobile
  - Acao de editar
  - Excluir com confirmacao

### Navegacao e visual base

- `src/components/Navbar.tsx`: barra superior desktop e tab bar mobile
- `src/components/ui/CategoryBadge.tsx`: badge de categoria com cor+emoji
- `src/components/ui/SummaryCard.tsx`: card de KPI
- `src/components/ui/EmptyState.tsx`: estado vazio reutilizavel
- `src/components/ui/ConfirmDialog.tsx`: confirmacao de acao destrutiva
- `src/components/ui/Toast.tsx`: notificacao temporaria

### Graficos

- `src/components/charts/SpendingPieChart.tsx`
- `src/components/charts/MonthlyBarChart.tsx`

Ambos leem centavos e convertem apenas para exibicao.

## 6) Testes

### `src/__tests__/format.test.ts`

Valida formatacao monetaria e datas.

### `src/__tests__/analytics.test.ts`

Valida agregacoes, top categoria e janela mensal.

### `src/__tests__/csv.test.ts`

Valida formato e escaping do CSV.

### `src/__tests__/expenseReducer.test.ts`

Valida transicoes do reducer (CRUD, filtros e hidratacao).

## 7) Configuracao e tooling

- `jest.config.cjs`: ambiente jsdom, alias `@/`, transform TS via `ts-jest`
- `jest.setup.ts`: matchers da Testing Library
- `tailwind.config.ts`: caminhos de scan + animacao `slide-up`
- `next.config.mjs`: config Next (atualmente minima)
- `postcss.config.mjs`: plugin Tailwind

## 8) Como evoluir sem quebrar comportamento

Ao adicionar novos campos de despesa:
1. Atualize tipos em `src/types/expense.ts`
2. Atualize formulario, lista e CSV
3. Atualize reducer e hidratacao (se necessario)
4. Adicione/ajuste testes de utilitarios e reducer

Ao adicionar nova visualizacao no dashboard:
1. Preferir novas funcoes puras em `src/lib/analytics.ts`
2. Manter componentes de grafico sem logica de persistencia
3. Evitar conversao de moeda fora da camada de exibicao

## 9) Checklist rapido para PR

- [ ] Nao introduziu float como fonte de verdade para valores monetarios
- [ ] Passou por reducer para mutacoes de estado
- [ ] Incluiu comentarios em pontos nao-obvios
- [ ] Atualizou testes relevantes
- [ ] `npm run lint` e `npm run test` sem falhas
