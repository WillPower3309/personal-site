import './globals.css'
import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'

import Navbar from './navbar'

// TODO:
const inter = Inter({ subsets: ['latin'] })
const manrope = Manrope({ subsets: ['latin'] })

export const metadata = () => {
  const title = "Will McKinnon"
  const description = "Will McKinnon's Personal Site"

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: "willmckinnon.com",
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
}

// TODO: theme switcher
export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Navbar />
        <div className="bg-gray-800 overflow-auto w-full">
          {children}
        </div>
      </body>
    </html>
  )
}

