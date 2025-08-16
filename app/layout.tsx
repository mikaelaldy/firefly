import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Firefly - ADHD Focus App',
  description: 'Overcome task paralysis and time blindness with AI-powered micro-tasks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}