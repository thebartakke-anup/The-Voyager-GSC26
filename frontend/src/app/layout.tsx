import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voyagers Tribute - Maritime Supply Chain Intelligence',
  description: 'Maritime Supply Chain Intelligence Platform for Google Solution Challenge 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
