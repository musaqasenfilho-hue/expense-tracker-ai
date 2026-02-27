'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '◎' },
  { href: '/expenses', label: 'Expenses', icon: '≡' },
  { href: '/expenses/new', label: 'Add', icon: '+' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">💰</span>
          <span className="text-lg font-semibold text-slate-900">ExpenseTracker</span>
        </div>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={twMerge(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav aria-label="Main navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            className={twMerge(
              'flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors',
              pathname === item.href
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
