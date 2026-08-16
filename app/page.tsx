'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Kanban, ArrowRight, Menu, X, Check, Zap,
  Users, MoveRight, LayoutGrid, CalendarClock,
  Palette, Star, Globe, Shield, ChevronDown,
} from 'lucide-react';
import { FAQS, TESTIMONIALS, FEATURES, STEPS } from '@/lib/landing-page-data';

/* ─── Marquee ────────────────────────────────────────────────────────────── */

const LOGOS = ['Stripe', 'Vercel', 'Figma', 'Linear', 'Notion', 'Loom', 'Framer', 'Retool', 'Intercom', 'Airtable'];

function Marquee() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <div className="relative overflow-hidden py-4 marquee-mask">
      <div className="flex gap-10 marquee-track whitespace-nowrap">
        {doubled.map((name, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[14px] font-bold tracking-tight text-[#C0C4CC] flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4C5FD5]/40" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PreviewCard {
  title: string;
  tag: string;
  tagColor: string;
  avatar: string;
  due?: string;
  progress?: number;
}

interface PreviewCol {
  color: string;
  label: string;
  cards: PreviewCard[];
}

function AppWindow() {
  const BOARD: { name: string; cols: PreviewCol[] } = {
    name: 'Q3 Product Launch',
    cols: [
      {
        color: '#4C5FD5',
        label: 'Backlog',
        cards: [
          { title: 'User research interviews', tag: 'Research', tagColor: '#8A5CF6', due: 'Aug 20', avatar: '#4C5FD5' },
          { title: 'Competitive analysis doc', tag: 'Docs', tagColor: '#17C3B2', due: 'Aug 22', avatar: '#17C3B2' },
          { title: 'Design system audit', tag: 'Design', tagColor: '#E8A33D', avatar: '#E8A33D' },
        ],
      },
      {
        color: '#17C3B2',
        label: 'In Progress',
        cards: [
          { title: 'Onboarding flow redesign', tag: 'Design', tagColor: '#E8A33D', due: 'Aug 18', avatar: '#4C5FD5', progress: 65 },
          { title: 'API rate limiting service', tag: 'Backend', tagColor: '#4C5FD5', due: 'Aug 19', avatar: '#17C3B2', progress: 40 },
        ],
      },
      {
        color: '#E8A33D',
        label: 'Review',
        cards: [
          { title: 'Landing page copy pass', tag: 'Content', tagColor: '#C4453D', due: 'Aug 17', avatar: '#E8A33D', progress: 90 },
          { title: 'Mobile performance audit', tag: 'Frontend', tagColor: '#4C5FD5', avatar: '#8A5CF6' },
        ],
      },
      {
        color: '#17C3B2',
        label: 'Done',
        cards: [
          { title: 'Auth flow implementation', tag: 'Backend', tagColor: '#4C5FD5', avatar: '#4C5FD5' },
          { title: 'Figma handoff complete', tag: 'Design', tagColor: '#E8A33D', avatar: '#17C3B2' },
        ],
      },
    ],
  };

  return (
    <div className="w-full select-none overflow-hidden rounded-2xl border border-white/[0.07] bg-[#13151F] shadow-[0_60px_120px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.05]">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0E1018]/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="ml-3 flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.04] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] text-white/30">app.tasksync.io / boards / {BOARD.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {['#4C5FD5','#17C3B2','#E8A33D'].map((c, i) => (
            <span key={i} style={{ background: c }} className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 text-[8px] font-bold text-white">
              {['JD','SK','MO'][i]}
            </span>
          ))}
          <span className="ml-1 text-[10px] text-white/25">3 online</span>
        </div>
      </div>

      {/* Sidebar + Board */}
      <div className="flex h-[360px]">
        {/* Mini sidebar */}
        <div className="hidden w-44 flex-shrink-0 border-r border-white/[0.05] bg-[#0E1018]/60 py-4 md:flex flex-col gap-0.5 px-2">
          {[
            { label: 'Dashboard', active: false },
            { label: 'Workspaces', active: true },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium ${
                item.active ? 'bg-white/[0.08] text-white' : 'text-white/30'
              }`}
            >
              <Kanban className="h-3 w-3" />
              {item.label}
            </div>
          ))}
          <div className="mt-4 px-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/20">Boards</p>
            {BOARD.cols.slice(0, 3).map((_, i) => (
              <div key={i} className="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: _.color }} />
                <span className="text-[10px] text-white/25 truncate">{_.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board area */}
        <div className="flex flex-1 items-start gap-3 overflow-x-auto p-4">
          {BOARD.cols.map((col, ci) => (
            <div key={ci} className="flex w-[170px] flex-shrink-0 flex-col rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
              {/* Col header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-[10.5px] font-semibold text-white/60">{col.label}</span>
                </div>
                <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-bold text-white/30">
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2">
                {col.cards.map((card, ri) => (
                  <div
                    key={ri}
                    className="app-card rounded-lg border border-white/[0.07] bg-[#1A1D2B] p-2.5"
                    style={{ animationDelay: `${(ci * 0.08 + ri * 0.06)}s` }}
                  >
                    <p className="text-[10px] font-medium leading-snug text-white/75">{card.title}</p>
                    {card.progress !== undefined && (
                      <div className="mt-2 h-0.5 rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full" style={{ width: `${card.progress}%`, background: col.color }} />
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[8px] font-semibold"
                        style={{ background: `${card.tagColor}18`, color: card.tagColor }}
                      >
                        {card.tag}
                      </span>
                      <div className="flex items-center gap-1">
                        {card.due && <span className="text-[8px] text-white/20">{card.due}</span>}
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/10 text-[6px] font-bold text-white" style={{ background: card.avatar }}>
                          {['JD','SK','MO','PK'][ci]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center gap-3 border-t border-white/[0.05] bg-[#0E1018]/60 px-4 py-2">
        <span className="flex items-center gap-1.5 text-[9.5px] text-white/25">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live — last updated 2s ago
        </span>
        <span className="ml-auto text-[9.5px] text-white/15">TaskSync · v2.4.1</span>
      </div>
    </div>
  );
}

/* ─── FAQ accordion ─────────────────────────────────────────────────────── */

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`group rounded-2xl border transition-all duration-200 ${open ? 'border-[#4C5FD5]/20 bg-[#F8F8FF]' : 'border-[#EAECF0] bg-white hover:border-[#D5D9E2]'}`}>
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left">
        <span className="text-[15px] font-semibold leading-snug text-[#101828]">{q}</span>
        <ChevronDown className={`mt-0.5 h-4 w-4 flex-shrink-0 text-[#667085] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-6 pb-5 text-[14px] leading-relaxed text-[#667085]">{a}</p>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <main className="overflow-x-hidden bg-white text-[#101828] antialiased">

      {/* ═══ NAVBAR ═══════════════════════════════════════════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-[0_1px_0_#E4E7EC] backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4C5FD5] shadow-[0_2px_8px_rgba(76,95,213,0.35)]">
              <Kanban className="h-4 w-4 text-white" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-[15.5px] font-bold tracking-tight text-[#101828]">
              TaskSync
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828]">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2 text-[13.5px] font-semibold text-[#667085] transition-colors hover:text-[#101828]">
              Log in
            </Link>
            <Link href="/signup" className="rounded-xl bg-[#101828] px-4 py-2 text-[13.5px] font-semibold text-white transition-all hover:bg-[#1D2939] hover:shadow-lg">
              Get started free
            </Link>
          </div>

          <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" className="rounded-lg p-2 text-[#667085] transition-colors hover:bg-[#F9FAFB] md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`overflow-hidden border-t border-[#F2F4F7] bg-white/95 backdrop-blur-xl transition-all duration-200 md:hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-0.5 px-4 py-3">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[14px] font-medium text-[#344054] hover:bg-[#F9FAFB]">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-[#F2F4F7] pt-3">
              <Link href="/login" className="flex-1 rounded-xl border border-[#D0D5DD] py-2.5 text-center text-[13.5px] font-semibold text-[#344054]">Log in</Link>
              <Link href="/signup" className="flex-1 rounded-xl bg-[#101828] py-2.5 text-center text-[13.5px] font-semibold text-white">Get started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080B14] px-5 pt-24 pb-0 sm:px-8">
        {/* Subtle grain texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', backgroundSize: '180px' }} />

        {/* Radial glow spots */}
        <div className="pointer-events-none absolute left-[20%] top-[25%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4C5FD5] opacity-[0.13] blur-[130px]" />
        <div className="pointer-events-none absolute right-[15%] top-[40%] h-[400px] w-[400px] rounded-full bg-[#17C3B2] opacity-[0.08] blur-[110px]" />

        {/* Eyebrow */}
        <div className="relative z-10 mb-7 flex items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-1.5 text-[12px] font-medium text-white/50 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17C3B2] animate-pulse" />
            Real-time collaboration for teams of every size
            <span className="ml-1 text-[#4C5FD5]/80">→</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 mx-auto max-w-[900px] text-center font-[family-name:var(--font-display)] text-[44px] font-extrabold leading-[1.04] tracking-[-0.03em] text-white sm:text-[62px] md:text-[76px]">
          Ship faster.<br />
          <span className="text-[#4C5FD5]">Stay in sync.</span>
        </h1>

        {/* Subheading */}
        <p className="relative z-10 mx-auto mt-6 max-w-[520px] text-center text-[16px] leading-relaxed text-white/40 sm:text-[17px]">
          TaskSync gives your team a shared space to plan, track, and deliver work — with every change reflected live across all members.
        </p>

        {/* CTAs */}
        <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-xl bg-[#4C5FD5] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_0_0_1px_rgba(76,95,213,0.3),0_8px_30px_rgba(76,95,213,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(76,95,213,0.4),0_16px_40px_rgba(76,95,213,0.45)]"
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-3.5 text-[14px] font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
          >
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <p className="relative z-10 mt-5 text-[12.5px] text-white/20">
          No credit card required &middot; Free plan forever
        </p>

        {/* App window */}
        <div className="relative z-10 mt-14 w-full max-w-[1100px]">
          <AppWindow />
          {/* Bottom fade to white */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>
      </section>

      {/* ═══ LOGO MARQUEE ═════════════════════════════════════════════════ */}
      <section className="border-y border-[#F2F4F7] bg-white py-6">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">
          Trusted by product teams at
        </p>
        <Marquee />
      </section>

      {/* ═══ FEATURES ═════════════════════════════════════════════════════ */}
      <section id="features" className="px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-[600px] text-center">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">Why teams choose TaskSync</p>
            <h2 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-tight tracking-tight text-[#101828] md:text-[44px]">
              Built for the way
              <br />teams actually work.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[#667085]">
              No bloat. No complex setup. Just the essential tools to capture, organize, and ship work—together.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#EAECF0] bg-[#EAECF0] sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative flex flex-col bg-white p-8 transition-colors duration-200 hover:bg-[#FAFAFA]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-none"
                  style={{ background: `radial-gradient(circle at 0% 0%, ${f.accent}06 0%, transparent 60%)` }} />
                <span
                  className="relative mb-5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.accent}12`, color: f.accent }}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="relative text-[16px] font-bold text-[#101828]">{f.title}</h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-[#667085]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#F9FAFB] px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-16 max-w-[560px] text-center">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">Process</p>
            <h2 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-tight tracking-tight text-[#101828] md:text-[44px]">
              From idea to shipped<br />in three steps.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ring-1 ring-[#EAECF0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(16,24,40,0.08)]">
                <div className="mb-6 flex items-center gap-3">
                  <span className="font-[family-name:var(--font-display)] text-[48px] font-black leading-none text-[#F2F4F7] transition-colors duration-300 group-hover:text-[#EEF0FD]">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-[19px] font-bold text-[#101828]">{s.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#667085]">{s.desc}</p>
                <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-[#4C5FD5] transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════ */}
      <section className="overflow-hidden px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-14 max-w-[520px] text-center">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">Testimonials</p>
            <h2 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-tight tracking-tight text-[#101828] md:text-[44px]">
              What teams are saying.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => {
              const featured = i === 1;
              return (
                <div
                  key={i}
                  className={`flex flex-col rounded-2xl p-7 transition-all duration-300 ${
                    featured
                      ? 'bg-[#101828] text-white shadow-[0_20px_60px_rgba(16,24,40,0.3)] md:-mt-3 md:mb-3'
                      : 'bg-[#F9FAFB] ring-1 ring-[#EAECF0]'
                  }`}
                >
                  {/* Stars */}
                  <div className="mb-5 flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className={`h-4 w-4 fill-current ${featured ? 'text-[#E8A33D]' : 'text-[#E8A33D]'}`} />
                    ))}
                  </div>

                  <p className={`flex-1 text-[14.5px] leading-relaxed ${featured ? 'text-white/80' : 'text-[#344054]'}`}>
                    "{t.quote}"
                  </p>

                  <div className={`mt-6 flex items-center gap-3 border-t pt-5 ${featured ? 'border-white/10' : 'border-[#EAECF0]'}`}>
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: ['#17C3B2', '#4C5FD5', '#E8A33D'][i] }}
                    >
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </span>
                    <div>
                      <p className={`text-[13.5px] font-bold ${featured ? 'text-white' : 'text-[#101828]'}`}>{t.name}</p>
                      <p className={`text-[12px] ${featured ? 'text-white/40' : 'text-[#98A2B3]'}`}>{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ══════════════════════════════════════════════════════ */}
      <section id="pricing" className="bg-[#F9FAFB] px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-14 max-w-[520px] text-center">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">Pricing</p>
            <h2 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-tight tracking-tight text-[#101828] md:text-[44px]">
              Simple, honest pricing.
            </h2>
            <p className="mt-4 text-[15.5px] text-[#667085]">No contracts. No hidden fees. Upgrade or downgrade anytime.</p>
          </div>

          <div className="mx-auto grid max-w-[880px] gap-5 sm:grid-cols-2">
            {/* Free */}
            <div className="flex flex-col rounded-2xl bg-white p-8 ring-1 ring-[#EAECF0]">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#98A2B3]">Free</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-display)] text-[52px] font-black leading-none text-[#101828]">$0</span>
                <span className="text-[14px] text-[#98A2B3]">/month</span>
              </div>
              <p className="mt-2 text-[13.5px] text-[#667085]">For individuals and small teams getting started.</p>

              <ul className="mt-8 flex flex-col gap-3.5">
                {['Unlimited boards & cards', '1 workspace', 'Core drag-and-drop', 'Due date tracking', 'Up to 3 members'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ECFDF3]">
                      <Check className="h-3 w-3 text-[#12B76A]" />
                    </span>
                    <span className="text-[13.5px] text-[#344054]">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-auto pt-8 block rounded-xl border border-[#D0D5DD] py-3 text-center text-[14px] font-semibold text-[#344054] transition-all hover:border-[#98A2B3] hover:bg-[#F9FAFB]">
                Get started free
              </Link>
            </div>

            {/* Team */}
            <div className="relative flex flex-col rounded-2xl bg-[#101828] p-8 shadow-[0_24px_60px_rgba(16,24,40,0.25)]">
              <span className="absolute -top-3.5 left-8 rounded-full bg-[#4C5FD5] px-3 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(76,95,213,0.4)]">
                Most popular
              </span>
              <p className="text-[12px] font-bold uppercase tracking-widest text-white/30">Team</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-display)] text-[52px] font-black leading-none text-white">$8</span>
                <span className="text-[14px] text-white/30">/member/month</span>
              </div>
              <p className="mt-2 text-[13.5px] text-white/50">Everything you need to run multiple teams and projects.</p>

              <ul className="mt-8 flex flex-col gap-3.5">
                {['Everything in Free', 'Unlimited workspaces', 'Unlimited team members', 'Role-based permissions', 'Priority support & SLA'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#4C5FD5]/20">
                      <Check className="h-3 w-3 text-[#4C5FD5]" />
                    </span>
                    <span className="text-[13.5px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-auto pt-8 block rounded-xl bg-[#4C5FD5] py-3 text-center text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(76,95,213,0.4)] transition-all hover:bg-[#3E4EC0] hover:shadow-[0_8px_24px_rgba(76,95,213,0.5)]">
                Start 14-day free trial →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ══════════════════════════════════════════════════════════ */}
      <section id="faq" className="px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">FAQ</p>
            <h2 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-tight tracking-tight text-[#101828] md:text-[44px]">
              Got questions?
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(item => <FAQ key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ════════════════════════════════════════════════════ */}
      <section className="px-5 pb-28 sm:px-8">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl bg-[#080B14] px-8 py-24 text-center">
          {/* Grain */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }} />
          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4C5FD5] opacity-[0.15] blur-[120px]" />

          <div className="relative">
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4C5FD5]">Get started today</p>
            <h2 className="mx-auto max-w-[660px] font-[family-name:var(--font-display)] text-[38px] font-extrabold leading-tight tracking-tight text-white md:text-[52px]">
              Your next board is<br />one click away.
            </h2>
            <p className="mx-auto mt-5 max-w-[440px] text-[15.5px] leading-relaxed text-white/35">
              Free to start. No credit card. No setup call. No waiting. Just your team, moving faster.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14px] font-bold text-[#101828] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)]">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-white/60 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:text-white">
                Log in to your account
              </Link>
            </div>

            <p className="mt-5 text-[12px] text-white/20">
              Joining 40,000+ teams · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#F2F4F7] bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4C5FD5]">
                <Kanban className="h-4 w-4 text-white" />
              </span>
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#101828]">TaskSync</span>
            </Link>
            <div className="flex items-center gap-6">
              {[...NAV_LINKS, { label: 'Log in', href: '/login' }].map(l => (
                <a key={l.label} href={l.href} className="text-[13px] font-medium text-[#667085] transition-colors hover:text-[#344054]">
                  {l.label}
                </a>
              ))}
            </div>
            <p className="text-[12.5px] text-[#98A2B3]">© {new Date().getFullYear()} TaskSync, Inc.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}