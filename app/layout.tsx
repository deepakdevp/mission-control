import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/navigation'
import { Toaster } from 'sonner'
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: "Mission Control ⚡ AI Command Center",
  description: "Your AI-powered command center for ultimate productivity. Manage tasks, approvals, events, and projects in one beautiful interface.",
  keywords: ["mission control", "AI workspace", "productivity", "task management", "Clawdbot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className} style={{ paddingLeft: '230px' }}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster 
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #EEEEEE',
              color: '#1A1A2E',
            },
          }}
        />
      </body>
    </html>
  );
}
