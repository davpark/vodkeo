import type { Metadata } from "next";
import { ThemeProvider } from 'next-themes'
import { Martian_Mono, Nanum_Myeongjo } from 'next/font/google'
import "./globals.css";
import { getSession } from '@/lib/session'
import Navbar from '@/components/Navbar'

const martianMono = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-latin',
  display: 'swap',
})

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-korean',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Vodkeo",
  other: {
    'adobe-fonts': '<link rel="stylesheet" href="https://use.typekit.net/bmg0zec.css">',
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en" className={`${martianMono.variable} ${nanumMyeongjo.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/bmg0zec.css" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar isLoggedIn={!!session} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}