import { Inter } from 'next/font/google'
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: "Campus Connect | Centralized Club & Event Platform",
  description: "A centralized platform for college clubs to manage events and students to stay updated.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
        {children}
      </body>
    </html>
  );
}
