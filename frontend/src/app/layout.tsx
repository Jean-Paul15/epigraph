import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EpiGraph - Analyse Epidemiologique',
  description: 'Plateforme d\'analyse de reseaux epidemiologiques avec Neo4j',
  keywords: ['epidemiologie', 'neo4j', 'graphe', 'covid-19', 'analyse'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <main className="min-h-screen bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  )
}
