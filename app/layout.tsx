import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Navbar from './navbar'

const inter = Inter({ subsets: ['latin'] })

// TODO: finish metadata
const title = 'Will McKinnon'
const description = 'TODO: update me'
export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: 'willmckinnon.com',
    siteName: title,
    // TODO: images: [ ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    // TODO: images: [ ],
  },
}

// TODO: theme switcher
export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Navbar />
        {children}
      </body>
    </html>
  )
}

