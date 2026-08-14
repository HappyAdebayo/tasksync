import type { Metadata } from 'next';
import { spaceGrotesk, inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tasksync',
  description: 'Boards that stay in sync.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-body)]">{children}</body>
    </html>
  );
}
