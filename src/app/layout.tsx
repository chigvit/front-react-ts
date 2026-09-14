import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/widgets/header/ui/Header'
import { Footer } from '@/widgets/footer/ui/Footer'
import { RegisterServiceWorker } from './register-sw'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })
const notoKR = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-kr'
})

export const metadata: Metadata = {
  title: 'MasterOnline - Service Booking Platform',
  description: 'Find a master for any job',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MasterOnline',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${notoKR.variable}`}>
        <RegisterServiceWorker />
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
