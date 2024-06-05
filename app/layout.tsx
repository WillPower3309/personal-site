import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Navbar from './navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Will McKinnon',
  description: 'TODO:  update me',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-row">
        <Navbar/>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  )
}
