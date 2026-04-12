import { Playfair_Display, Inter } from 'next/font/google'
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: "Campus Connect | Centralized Club & Event Platform",
  description: "A centralized platform for college clubs to manage events and students to stay updated.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-black selection:text-white">
        <main className="flex-grow">
          {children}
        </main>
        <footer className="border-t border-black/5 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

