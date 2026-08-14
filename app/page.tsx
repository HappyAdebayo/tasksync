'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  ArrowRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Quote,
  Users,
  MoveRight,
  Palette,
  CalendarClock,
  Zap,
  Check,
} from 'lucide-react';
import { FAQS,TESTIMONIALS, FEATURES, STEPS } from '@/lib/landing-page-data';
/* ---------- Data ---------- */



/* ---------- Living board (hero signature element) ---------- */

function LivingBoard() {
  const columns = [
    { accent: '#4C5FD5', cards: [58, 74, 40] },
    { accent: '#E8A33D', cards: [66, 45] },
    { accent: '#17C3B2', cards: [50, 62, 34] },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="rounded-2xl border border-[#E3E5EC] bg-white p-4 shadow-[0_24px_60px_rgba(23,26,33,0.10)]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E5EC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E5EC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E3E5EC]" />
          <span className="ml-2 font-mono text-[10px] tracking-wide text-[#B0B4C0]">
            product-launch.board
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {columns.map((col, ci) => (
            <div key={ci} className="rounded-xl bg-[#F6F7FB] p-2">
              <div className="mb-2 flex items-center gap-1.5 px-0.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.accent }} />
                <span className="h-1.5 w-8 rounded-full bg-[#D3D7E3]" />
              </div>
              <div className="flex flex-col gap-1.5">
                {col.cards.map((w, ri) => (
                  <div
                    key={ri}
                    className="living-card rounded-lg border border-[#E3E5EC] bg-white p-2 shadow-[0_1px_2px_rgba(23,26,33,0.04)]"
                    style={{ animationDelay: `${(ci * 3 + ri) * 0.15}s` }}
                  >
                    <span className="block h-1.5 rounded-full bg-[#E3E5EC]" style={{ width: `${w}%` }} />
                    <span className="mt-1.5 block h-1.5 w-6 rounded-full bg-[#EEEFF3]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost card that drifts from column 1 to column 3, looping */}
      <div className="drift-card pointer-events-none absolute left-[8%] top-[38%] w-[26%] rounded-lg border border-[#4C5FD5]/30 bg-white p-2 shadow-[0_10px_24px_rgba(76,95,213,0.18)]">
        <span className="block h-1.5 w-4/5 rounded-full bg-[#4C5FD5]/25" />
        <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-[#4C5FD5]/15" />
      </div>

      <style jsx>{`
        .living-card {
          animation: settle 0.6s ease both;
        }
        @keyframes settle {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .drift-card {
          animation: drift 7s ease-in-out infinite;
        }
        @keyframes drift {
          0%,
          8% {
            transform: translate(0, 0);
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          45%,
          55% {
            transform: translate(150%, 10px);
            opacity: 1;
          }
          80% {
            transform: translate(300%, -6px);
            opacity: 1;
          }
          92%,
          100% {
            transform: translate(300%, -6px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .living-card,
          .drift-card {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- Page ---------- */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tIndex, setTIndex] = useState(0);

  function nextTestimonial() {
    setTIndex((i) => (i + 1) % TESTIMONIALS.length);
  }
  function prevTestimonial() {
    setTIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  return (
    <main className="bg-[#F6F7FB] text-[#171A21]">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-30 border-b border-[#E3E5EC]/80 bg-[#F6F7FB]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4C5FD5] text-white">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-[16px] font-semibold">
              Flowdeck
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-[13.5px] font-medium text-[#6B7280] hover:text-[#171A21]">
              Features
            </a>
            <a href="#how-it-works" className="text-[13.5px] font-medium text-[#6B7280] hover:text-[#171A21]">
              How it works
            </a>
            <a href="#pricing" className="text-[13.5px] font-medium text-[#6B7280] hover:text-[#171A21]">
              Pricing
            </a>
            <a href="#faq" className="text-[13.5px] font-medium text-[#6B7280] hover:text-[#171A21]">
              FAQ
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-[13.5px] font-medium text-[#6B7280] hover:text-[#171A21]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#4C5FD5] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
            >
              Start for free
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-md p-1.5 text-[#171A21] md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E3E5EC] bg-[#F6F7FB] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-[14px] font-medium text-[#171A21]">
                Features
              </a>
              <a href="#how-it-works" className="text-[14px] font-medium text-[#171A21]">
                How it works
              </a>
              <a href="#pricing" className="text-[14px] font-medium text-[#171A21]">
                Pricing
              </a>
              <a href="#faq" className="text-[14px] font-medium text-[#171A21]">
                FAQ
              </a>
              <div className="mt-2 flex items-center gap-3 border-t border-[#E3E5EC] pt-4">
                <Link href="/login" className="text-[14px] font-medium text-[#6B7280]">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#4C5FD5] px-4 py-2 text-[13.5px] font-medium text-white"
                >
                  Start for free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section
        className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24"
        style={{
          backgroundImage: 'radial-gradient(#E3E5EC 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          backgroundPosition: '-11px -11px',
        }}
      >
        <div className="mx-auto grid max-w-[1160px] items-center gap-14 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E5EC] bg-white px-3 py-1 font-mono text-[11px] tracking-wide text-[#6B7280]">
              FOR TEAMS WHO SHIP
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[38px] font-semibold leading-[1.1] tracking-tight md:text-[48px]">
              The board that keeps itself tidy.
            </h1>
            <p className="mt-5 max-w-[440px] text-[15.5px] leading-relaxed text-[#6B7280]">
              Flowdeck turns scattered tasks into workspaces, boards, and lists your
              team actually keeps up to date \u2014 because staying organized takes one
              drag, not ten meetings.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded-full bg-[#4C5FD5] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-[#E3E5EC] bg-white px-5 py-3 text-[14px] font-medium text-[#171A21] transition-colors hover:border-[#D3D7E3]"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-[12.5px] text-[#B0B4C0]">No credit card required.</p>
          </div>

          <LivingBoard />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 max-w-[540px]">
            <span className="font-mono text-[11px] tracking-wide text-[#4C5FD5]">
              BUILT FOR THE DAILY GRIND
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight md:text-[32px]">
              Everything a real workflow needs, nothing it doesn't.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#E3E5EC] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#D3D7E3] hover:shadow-[0_8px_20px_rgba(23,26,33,0.06)]"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${f.accent}1A`, color: f.accent }}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-[#171A21]">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6B7280]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-14 max-w-[540px]">
            <span className="font-mono text-[11px] tracking-wide text-[#4C5FD5]">
              THREE STEPS, EVERY TIME
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight md:text-[32px]">
              From scattered to sorted.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <span className="absolute right-[-20px] top-4 hidden h-px w-10 bg-[#D3D7E3] md:block" />
                )}
                <span className="font-mono text-[13px] font-medium text-[#B0B4C0]">{s.n}</span>
                <h3 className="mt-2 text-[17px] font-semibold text-[#171A21]">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B7280]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="font-mono text-[11px] tracking-wide text-[#4C5FD5]">WHAT TEAMS SAY</span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight md:text-[32px]">
            Boards people actually keep updated.
          </h2>

          <div className="relative mt-10 rounded-2xl border border-[#E3E5EC] bg-white p-8 shadow-[0_8px_20px_rgba(23,26,33,0.05)] md:p-10">
            <Quote className="mx-auto h-6 w-6 text-[#D3D7E3]" />
            <p className="mt-4 text-[16px] leading-relaxed text-[#171A21] md:text-[18px]">
              {TESTIMONIALS[tIndex].quote}
            </p>
            <p className="mt-5 text-[13.5px] font-semibold text-[#171A21]">
              {TESTIMONIALS[tIndex].name}
              <span className="ml-1.5 font-normal text-[#6B7280]">
                &middot; {TESTIMONIALS[tIndex].role}
              </span>
            </p>

            <div className="mt-7 flex items-center justify-center gap-4">
              <button
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
                className="rounded-full border border-[#E3E5EC] p-2 text-[#6B7280] transition-colors hover:border-[#D3D7E3] hover:text-[#171A21]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === tIndex ? 'w-5 bg-[#4C5FD5]' : 'w-1.5 bg-[#D3D7E3]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                aria-label="Next testimonial"
                className="rounded-full border border-[#E3E5EC] p-2 text-[#6B7280] transition-colors hover:border-[#D3D7E3] hover:text-[#171A21]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 text-center">
            <span className="font-mono text-[11px] tracking-wide text-[#4C5FD5]">PRICING</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight md:text-[32px]">
              Start free. Upgrade when your team does.
            </h2>
          </div>

          <div className="mx-auto grid max-w-[720px] gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E3E5EC] bg-white p-7">
              <h3 className="text-[15px] font-semibold text-[#171A21]">Free</h3>
              <p className="mt-1 text-[13px] text-[#6B7280]">For individuals and small projects.</p>
              <p className="mt-5 text-[32px] font-semibold text-[#171A21]">
                $0<span className="text-[14px] font-normal text-[#6B7280]">/month</span>
              </p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {['Unlimited boards', 'Unlimited cards', '1 workspace', 'Core drag-and-drop'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13.5px] text-[#171A21]">
                    <Check className="h-4 w-4 flex-shrink-0 text-[#17C3B2]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-7 block rounded-full border border-[#E3E5EC] py-2.5 text-center text-[13.5px] font-medium text-[#171A21] transition-colors hover:border-[#D3D7E3]"
              >
                Start for free
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-[#4C5FD5] bg-white p-7">
              <span className="absolute -top-3 left-7 rounded-full bg-[#4C5FD5] px-2.5 py-0.5 text-[11px] font-medium text-white">
                Most popular
              </span>
              <h3 className="text-[15px] font-semibold text-[#171A21]">Team</h3>
              <p className="mt-1 text-[13px] text-[#6B7280]">For teams working across workspaces.</p>
              <p className="mt-5 text-[32px] font-semibold text-[#171A21]">
                $8<span className="text-[14px] font-normal text-[#6B7280]">/user/month</span>
              </p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {['Everything in Free', 'Unlimited workspaces', 'Invite unlimited members', 'Priority support'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-[13.5px] text-[#171A21]">
                      <Check className="h-4 w-4 flex-shrink-0 text-[#17C3B2]" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/signup"
                className="mt-7 block rounded-full bg-[#4C5FD5] py-2.5 text-center text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-10 text-center">
            <span className="font-mono text-[11px] tracking-wide text-[#4C5FD5]">FAQ</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight md:text-[32px]">
              Questions, answered.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-[#E3E5EC] bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium text-[#171A21]">
                  {item.q}
                  <span className="ml-4 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#E3E5EC] text-[13px] text-[#6B7280] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#6B7280]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1160px] rounded-3xl bg-[#4C5FD5] px-8 py-14 text-center md:py-16">
          <h2 className="font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-tight text-white md:text-[34px]">
            Your next board is one click away.
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] text-white/80">
            Free to start. No credit card, no setup call, no waiting.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#4C5FD5] transition-colors hover:bg-white/90"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-[#E3E5EC] px-6 py-10">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4C5FD5] text-white">
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-[14.5px] font-semibold">
              Flowdeck
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[#6B7280]">
            <a href="#features" className="hover:text-[#171A21]">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#171A21]">
              Pricing
            </a>
            <Link href="/login" className="hover:text-[#171A21]">
              Log in
            </Link>
          </div>
          <p className="text-[12.5px] text-[#B0B4C0]">&copy; {new Date().getFullYear()} Flowdeck.</p>
        </div>
      </footer>
    </main>
  );
}