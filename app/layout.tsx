import type { Metadata } from 'next';
import { spaceGrotesk, inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskSync — Ship faster. Stay in sync.',
  description: 'TaskSync gives your team a shared space to plan, track, and deliver work — with every change reflected live across all members. Free to start.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-body)]">{children}</body>
    </html>
  );
}
