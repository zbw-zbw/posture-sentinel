"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/detect", label: "实时检测" },
  { href: "/report", label: "健康日报" },
  { href: "/settings", label: "设置" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    const t = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-text-primary">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22" />
              <path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span>体态哨兵</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary-light"
                    : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/#about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
            >
              关于
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary md:hidden"
            aria-label="菜单"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden animate-[fadeIn_0.2s_ease]" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl md:hidden animate-slide-in-right">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <span className="font-bold text-text-primary">导航</span>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center min-h-12 px-4 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary-light"
                      : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/#about"
                onClick={() => setMobileOpen(false)}
                className="flex items-center min-h-12 px-4 rounded-xl text-base font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
              >
                关于
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
