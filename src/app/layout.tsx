import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Factory & Mill Assessment System',
  description: 'Audit and assessment application for factories and mills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}