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
      <body className="flex flex-row h-screen bg-gray-900">
        <Navbar/>
        <main className="flex-grow bg-white m-2 rounded-3xl">
          {children}
        </main>
      </body>
    </html>
  )
}

