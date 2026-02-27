# Expense Tracker AI

Aplicacao web para controle de gastos pessoais, com foco em simplicidade de uso e codigo facil de manter.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Recharts
- Jest + Testing Library
- Persistencia local via `localStorage`

## Funcionalidades

- Cadastro, edicao e exclusao de despesas
- Filtros por categoria, periodo e texto
- Dashboard com indicadores e graficos
- Exportacao CSV do resultado filtrado
- Layout responsivo (desktop + mobile)

## Regras de dominio

- `amount` e sempre armazenado em **centavos** (`number` inteiro)
- `date` usa formato `YYYY-MM-DD`
- Categorias sao controladas por union type (`Category`)
- Filtros pertencem ao estado global, mas apenas despesas sao persistidas

## Fluxo de dados

1. `ExpenseProvider` inicializa estado com `useReducer`
2. Na montagem, o provider hidrata despesas do `localStorage`
3. Componentes disparam acoes (`ADD_EXPENSE`, `UPDATE_EXPENSE`, etc.)
4. Reducer produz novo estado imutavel
5. Alteracoes em `expenses` sao persistidas novamente no `localStorage`
6. Paginas/graficos recalculam visoes derivadas a partir do estado atual

## Estrutura principal

```text
src/
  app/
    page.tsx                    # Dashboard
    expenses/page.tsx           # Lista + filtros + exportacao
    expenses/new/page.tsx       # Cadastro
    expenses/[id]/edit/page.tsx # Edicao
    layout.tsx                  # Shell global + provider
  components/
    ExpenseForm.tsx             # Formulario create/edit
    ExpenseRow.tsx              # Linha/cartao da listagem
    charts/                     # Recharts (pizza + barras)
    ui/                         # Componentes visuais reutilizaveis
  context/
    ExpenseContext.tsx          # Estado global + reducer + persistencia
  lib/
    analytics.ts                # Agregacoes para dashboard/graficos
    format.ts                   # Conversoes moeda/data
    csv.ts                      # Geracao/download CSV
  types/
    expense.ts                  # Contratos de dominio
```

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: build de producao
- `npm run start`: executa build em modo server
- `npm run lint`: lint (Next + ESLint)
- `npm run test`: executa testes
- `npm run test:watch`: testes em watch mode

## Como rodar localmente

```bash
npm install
npm run dev
```

Aplicacao disponivel em `http://localhost:3000`.

## Testes

```bash
npm run test
```

Cobertura atual foca utilitarios e reducer (regras de negocio centrais).

## Documentacao adicional

- [Design original](/docs/plans/2026-02-27-expense-tracker-design.md)
- [Plano de implementacao](/docs/plans/2026-02-27-expense-tracker-implementation.md)
- [Guia tecnico do codigo](/docs/codebase-guide.md)

## Convencoes de manutencao

- Evite logica de negocio em componentes quando puder mover para `src/lib`
- Mantenha operacoes monetarias em centavos ate a camada de exibicao
- Sempre passe por `dispatch` para mutacoes de estado
- Ao adicionar categoria nova, atualize:
  - `CATEGORIES`
  - `CATEGORY_COLORS`
  - `CATEGORY_BG`
  - testes e filtros relacionados
