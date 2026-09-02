import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Filtroamb - Gestão de Frota',
  description: 'Sistema interno de gestão de frota',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
  <html lang="pt-BR">
    <body>
      <ThemeProvider>{children}</ThemeProvider>
    </body>
  </html>
</ClerkProvider>
  )
}