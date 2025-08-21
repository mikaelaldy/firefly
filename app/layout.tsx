import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'
import { PreferencesProvider } from '@/lib/preferences/context'

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
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <PreferencesProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}