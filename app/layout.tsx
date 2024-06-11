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
      <body className="flex flex-row h-screen bg-gray-700">
        <Navbar/>
        <main className="bg-gray-800">
          {children}
        </main>
      </body>
    </html>
  )
}

