<<<<<<< HEAD

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from "@/components/ui/toaster";
import { PageTransitionLoader } from '@/components/page-transition-loader';

// Olá, futuro eu. Lembre-se da dor que foi fazer isso funcionar. Ass: davidson.dev.br
export const metadata: Metadata = {
  title: 'InfraVision',
  description: 'A robust data center management app to visualize and monitor IT infrastructure.',
=======
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'InfraCenter Manager',
  description: 'Manage your datacenter infrastructure with an interactive floor plan.',
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className="dark" suppressHydrationWarning>
=======
    <html lang="en" suppressHydrationWarning>
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<<<<<<< HEAD
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <PageTransitionLoader />
            {children}
        </AuthProvider>
=======
      </head>
      <body className="font-body antialiased">
        {children}
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
        <Toaster />
      </body>
    </html>
  );
}
