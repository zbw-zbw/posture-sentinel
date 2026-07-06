/**
 * Unified brand logo for 体态哨兵 (Posture Sentinel).
 * Used in Navbar, FooterCTASection, and anywhere the brand mark appears.
 *
 * The mark depicts a stylized spine: a central vertical line with
 * horizontal vertebrae, flanked by two curved rib outlines, and three
 * alignment dots. The gradient background matches the primary brand color.
 */

import { COLORS } from "@/lib/colors";

interface LogoProps {
  /** Pixel size for both width and height. Default: 28 */
  size?: number;
  /** Whether to show the text label next to the mark. Default: false */
  showText?: boolean;
  /** Text size class (Tailwind). Default: "text-lg" */
  textClassName?: string;
  className?: string;
}

export default function Logo({
  size = 28,
  showText = false,
  textClassName = "text-lg font-bold text-text-primary",
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.primary} />
            <stop offset="100%" stopColor={COLORS.primaryDark} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#logoGradient)" />
        {/* Rib curves */}
        <path
          d="M50 18 C50 18 36 34 36 52 C36 70 50 84 50 84"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M50 18 C50 18 64 34 64 52 C64 70 50 84 50 84"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Spine line */}
        <line x1="50" y1="18" x2="50" y2="84" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* Vertebrae */}
        <line x1="38" y1="42" x2="62" y2="42" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <line x1="38" y1="62" x2="62" y2="62" stroke="white" strokeWidth="4" strokeLinecap="round" />
        {/* Alignment dots */}
        <circle cx="50" cy="30" r="3.5" fill="white" />
        <circle cx="50" cy="50" r="3.5" fill="white" />
        <circle cx="50" cy="70" r="3.5" fill="white" />
      </svg>
      {showText && <span className={textClassName}>体态哨兵</span>}
    </span>
  );
}
