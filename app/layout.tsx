import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'
import { PreferencesProvider } from '@/lib/preferences/context'
import { ActionSessionProvider } from '@/lib/action-sessions/context'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

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
            <ActionSessionProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </ActionSessionProvider>
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}