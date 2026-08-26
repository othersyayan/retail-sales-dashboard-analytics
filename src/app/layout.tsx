import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Retail Sales Analytics Dashboard',
  description: 'Real-time retail sales metrics, filtering, and transaction exploration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
