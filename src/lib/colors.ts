/**
 * Shared color constants for use in Canvas 2D contexts and SVG where
 * CSS custom properties (var(--color-primary)) cannot be resolved.
 *
 * These values MUST stay in sync with the design tokens in globals.css.
 * If you change a token in globals.css, update the corresponding value here.
 */

export const COLORS = {
  primary: "#10b981",
  primaryDark: "#047857",
  primaryLight: "#d1fae5",
  primaryText: "#047857",

  warning: "#f59e0b",
  warningLight: "#fef3c7",
  warningText: "#b45309",

  danger: "#ef4444",
  dangerLight: "#fee2e2",
  dangerText: "#b91c1c",

  info: "#3b82f6",
  infoLight: "#dbeafe",
  infoText: "#1d4ed8",

  // Surfaces
  bg: "#f8fafb",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  border: "#e2e8f0",

  // Text
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",

  // Dark
  dark: "#1e293b",
  darkSurface: "#334155",

  // Skeleton overlay (pose detection)
  skeletonGood: "#10b981",
  skeletonWarning: "#f59e0b",
  skeletonBad: "#ef4444",
  skeletonLine: "#64748b",
  skeletonJoint: "#ffffff",
  skeletonJointBorder: "#0f172a",

  // HeroDemo canvas
  heroBgDark: "#0f172a",
  heroBgMid: "#1e293b",
  heroSkeleton: "#10b981",
  heroJoint: "#ffffff",
  heroText: "#94a3b8",
  heroPulse: "#10b981",
} as const;

/**
 * Get the posture score color based on score value.
 * Used by Canvas/SVG components that can't use CSS classes.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.primary;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

/**
 * Get the posture score text color (darker, WCAG AA on light bg).
 */
export function getScoreTextColor(score: number): string {
  if (score >= 80) return COLORS.primaryText;
  if (score >= 60) return COLORS.warningText;
  return COLORS.dangerText;
}
