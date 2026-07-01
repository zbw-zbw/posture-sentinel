"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/detect", label: "实时检测" },
  { href: "/report", label: "健康日报" },
  { href: "/settings", label: "设置" },
];

const subLinks = [
  { href: "/achievements", label: "成就徽章", icon: "🏆" },
  { href: "/data", label: "数据管理", icon: "💾" },
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
            ? "bg-bg/90 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-text-primary">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <defs>
                <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#059669"/>
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="24" fill="url(#logoBg)"/>
              <path d="M50 18 C50 18 36 34 36 52 C36 70 50 84 50 84" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M50 18 C50 18 64 34 64 52 C64 70 50 84 50 84" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"/>
              <line x1="50" y1="18" x2="50" y2="84" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <line x1="38" y1="42" x2="62" y2="42" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <line x1="38" y1="62" x2="62" y2="62" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="50" cy="30" r="3.5" fill="white"/>
              <circle cx="50" cy="50" r="3.5" fill="white"/>
              <circle cx="50" cy="70" r="3.5" fill="white"/>
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
            <div className="flex items-center justify-between h-16 px-4">
              <span className="font-bold text-text-primary">导航</span>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              {/* Home link */}
              <Link
                href="/"
                className={`flex items-center min-h-12 px-4 rounded-xl text-base font-medium transition-colors ${
                  isActive("/")
                    ? "text-primary bg-primary-light"
                    : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                首页
              </Link>
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
              {/* Divider */}
              <div className="h-px bg-border my-2" />
              {subLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center min-h-12 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary-light"
                      : "text-text-muted hover:bg-surface-alt hover:text-text-primary"
                  }`}
                >
                  <span className="mr-3 text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
