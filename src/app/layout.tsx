import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NovaBank Digital | Plataforma Financiera Next.js 16',
  description:
    'Banca digital inteligente desarrollada con Next.js 16 App Router, TypeScript y flujo de Vibe Coding.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: algunas extensiones del navegador añaden atributos
    // a <html> antes de hidratar; solo afecta a los atributos de esta etiqueta.
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mt-16 border-t border-slate-900 bg-slate-950/60 py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4">
            NovaBank Digital • Desarrollado con Next.js 16 App Router, TypeScript y Tailwind CSS • Metodología Vibe Coding
          </div>
        </footer>
      </body>
    </html>
  );
}
