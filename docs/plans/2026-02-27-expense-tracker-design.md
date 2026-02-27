# Expense Tracker AI — Design Document

**Date:** 2026-02-27
**Status:** Approved

---

## Overview

A modern, production-quality personal expense tracking web application built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Recharts. Data persists in localStorage. State is managed with React Context + useReducer.

---

## Architecture

### State Management

A single `ExpenseContext` wraps the entire application. State is managed via `useReducer` and persisted to `localStorage` on every dispatch.

**Actions:**
- `ADD_EXPENSE`
- `UPDATE_EXPENSE`
- `DELETE_EXPENSE`
- `SET_FILTER`

**Data model:**

```ts
type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other'

interface Expense {
  id: string          // crypto.randomUUID()
  date: string        // ISO date string YYYY-MM-DD
  amount: number      // stored in cents to avoid float precision issues
  category: Category
  description: string
  createdAt: string   // ISO timestamp
}

interface FilterState {
  dateFrom: string | null
  dateTo: string | null
  category: Category | 'All'
  searchQuery: string
}

interface AppState {
  expenses: Expense[]
  filters: FilterState
}
```

### Routing (App Router)

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/expenses` | Expense list with filters |
| `/expenses/new` | Add expense form |
| `/expenses/[id]/edit` | Edit expense form |

---

## Pages & Components

### Dashboard (`/`)
- 3 summary cards: Total All-Time Spend, This Month's Spend, Top Category
- Pie chart: category share of spending (Recharts `PieChart`)
- Bar chart: last 6 months spending by month (Recharts `BarChart`)
- Recent expenses list (5 most recent, linked to `/expenses`)

### Expenses List (`/expenses`)
- Search bar (filters description field)
- Filter row: date-from / date-to + category dropdown
- Sortable list (date descending by default)
- Each row: date, description, category badge, amount, edit + delete buttons
- CSV export button (downloads filtered result set)
- Empty state when no expenses match filters

### Add/Edit Form
- Fields: Date, Amount, Category, Description
- Inline validation: all required, amount must be positive, date validated
- Loading spinner on submit, success toast on save

### Shared Components
- `Navbar` — collapses to bottom tab bar on mobile
- `CategoryBadge` — color-coded per category
- `SummaryCard` — reusable metric card
- `ConfirmDialog` — modal for delete confirmation
- `Toast` — slide-in notification (bottom-right)

---

## Styling

**Framework:** Tailwind CSS + `tailwind-merge`

**Color palette (Slate + Indigo):**
- Page background: `slate-50`
- Cards: `white` + `slate-200` border + subtle shadow
- Primary accent: `indigo-600`
- Danger: `red-600`
- Success: `emerald-500`

**Category badge colors:**
| Category | Color |
|---|---|
| Food | orange |
| Transportation | blue |
| Entertainment | purple |
| Shopping | pink |
| Bills | red |
| Other | slate |

**Typography:** Inter (via `next/font/google`), `slate-900` headings, `slate-600` secondary.

**Responsive:**
- Mobile-first Tailwind breakpoints
- Navbar → bottom tab bar on `< md`
- Cards stack vertically on mobile
- Table → card list on mobile

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State | React Context + useReducer |
| Persistence | localStorage |
| Font | Inter (next/font/google) |

---

## Out of Scope

- Authentication / multi-user
- Server-side data storage
- Budget/limit alerts
- Recurring expenses
- Receipt image uploads
