import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ExpenseProvider } from '@/context/ExpenseContext'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ExpenseTracker',
  description: 'Track your personal finances with ease',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Provider wraps the full app so all routes share the same in-memory state. */}
        <ExpenseProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Mobile layout reserves space for fixed bottom tab bar. */}
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </ExpenseProvider>
      </body>
    </html>
  )
}
