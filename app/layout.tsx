import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import { Navigation } from '@/components/navigation'
import { Toaster } from 'sonner'
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-display',
})

const plusJakarta = Plus_Jakarta_Sans({ 
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
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className={plusJakarta.className} style={{ paddingLeft: '256px' }}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 15, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              color: '#e5e5e5',
            },
          }}
        />
      </body>
    </html>
  );
}
