import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/widgets/header/ui/Header'
import { Footer } from '@/widgets/footer/ui/Footer'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })
const notoKR = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-kr'
})

export const metadata: Metadata = {
  title: 'Майстер Онлайн - Сервіс замовлення послуг',
  description: 'Знайдіть майстра для будь-якої роботи',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={`${inter.className} ${notoKR.variable}`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
