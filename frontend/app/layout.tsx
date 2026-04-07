import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EquiX Frontend',
  description: 'EquiX Token Capital dashboard frontend'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
