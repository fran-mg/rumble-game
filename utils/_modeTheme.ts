import * as LucideIcons from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModeAccent {
  color: string;
  colorMuted: string;
  colorBg: string;
  colorBorder: string;
}

export interface ModeCardTheme {
  gradientTop: string;
  gradientBottom: string;
  shadowColor: string;
  accentColor: string;
  labelColor: string;
  label: string;
  innerBorder: string;
}

export interface ModeMeta {
  label: string;
  description: string;
  Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  orientationBadge: string;
  orientation: "landscape" | "portrait" | "any";
  usesTilt: boolean;
  showsForbiddenWords: boolean;
  showsButtons: boolean;
}

export interface ModeTheme {
  accent: ModeAccent;
  card: ModeCardTheme;
  meta: ModeMeta;
}

// ─── Flash / Result Themes ────────────────────────────────────────────────────

export const FLASH_THEMES: Record<"pass" | "done", ModeCardTheme> = {
  pass: {
    gradientTop: "#c2410c",
    gradientBottom: "#431407",
    shadowColor: "#f97316",
    accentColor: "#fdba74",
    labelColor: "#fed7aa",
    label: "PASS",
    innerBorder: "rgba(253,186,116,0.25)",
  },
  done: {
    gradientTop: "#166534",
    gradientBottom: "#052e16",
    shadowColor: "#22c55e",
    accentColor: "#86efac",
    labelColor: "#bbf7d0",
    label: "CORRECT",
    innerBorder: "rgba(134,239,172,0.25)",
  },
};

// ─── Mode Themes ──────────────────────────────────────────────────────────────

export const MODE_THEMES: Record<string, ModeTheme> = {
  headsup: {
    accent: {
      color: "#6366f1",
      colorMuted: "#c7d2fe",
      colorBg: "rgba(99,102,241,0.12)",
      colorBorder: "rgba(99,102,241,0.35)",
    },
    card: {
      gradientTop: "#4f46e5",
      gradientBottom: "#1e1b4b",
      shadowColor: "#4f46e5",
      accentColor: "#a5b4fc",
      labelColor: "#c7d2fe",
      label: "HEADS UP",
      innerBorder: "rgba(165,180,252,0.2)",
    },
    meta: {
      label: "Heads Up",
      description:
        "Hold to your forehead. Tilt to pass or score. Others describe word.",
      Icon: LucideIcons.Smartphone,
      orientationBadge: "Landscape",
      orientation: "landscape",
      usesTilt: true,
      showsForbiddenWords: false,
      showsButtons: false,
    },
  },

  taboo: {
    accent: {
      color: "#0891b2",
      colorMuted: "#a5f3fc",
      colorBg: "rgba(8,145,178,0.12)",
      colorBorder: "rgba(8,145,178,0.35)",
    },
    card: {
      gradientTop: "#0e7490",
      gradientBottom: "#042f3e",
      shadowColor: "#0891b2",
      accentColor: "#67e8f9",
      labelColor: "#a5f3fc",
      label: "TABOO",
      innerBorder: "rgba(103,232,249,0.2)",
    },
    meta: {
      label: "Taboo / Charades",
      description: "Describe or act it out as fast as you can.",
      Icon: LucideIcons.Drama,
      orientationBadge: "Either",
      orientation: "any",
      usesTilt: false,
      showsForbiddenWords: false,
      showsButtons: true,
    },
  },

  forbidden: {
    accent: {
      color: "#e11d48",
      colorMuted: "#fecdd3",
      colorBg: "rgba(225,29,72,0.12)",
      colorBorder: "rgba(225,29,72,0.35)",
    },
    card: {
      gradientTop: "#9f1239",
      gradientBottom: "#4c0519",
      shadowColor: "#e11d48",
      accentColor: "#fda4af",
      labelColor: "#fecdd3",
      label: "FORBIDDEN",
      innerBorder: "rgba(253,164,175,0.2)",
    },
    meta: {
      label: "Forbidden",
      description: "Describe the word without saying the forbidden ones.",
      Icon: LucideIcons.CircleSlash,
      orientationBadge: "Portrait",
      orientation: "portrait",
      usesTilt: false,
      showsForbiddenWords: true,
      showsButtons: true,
    },
  },
};

// ─── Fallback ─────────────────────────────────────────────────────────────────

export const DEFAULT_MODE_THEME = MODE_THEMES.taboo;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safe lookup — always returns a full ModeTheme, falling back to taboo.
 *
 *   const { accent, card, meta } = getModeTheme(mode);
 */
export function getModeTheme(mode: string): ModeTheme {
  return MODE_THEMES[mode] ?? DEFAULT_MODE_THEME;
}

/**
 * Resolve the card theme for the current flash state.
 * During pass/done flashes the card overrides its gradient with the
 * shared flash theme while keeping the base mode theme for the label pill.
 *
 *   const cardTheme = resolveCardTheme(mode, flashState);
 */
export function resolveCardTheme(
  mode: string,
  flashState: "default" | "pass" | "done",
): ModeCardTheme {
  if (flashState === "pass") return FLASH_THEMES.pass;
  if (flashState === "done") return FLASH_THEMES.done;
  return getModeTheme(mode).card;
}

/**
 * Convenience — returns just the accent for settings/UI surfaces.
 *
 *   const accent = getModeAccent(mode);
 */
export function getModeAccent(mode: string): ModeAccent {
  return getModeTheme(mode).accent;
}

/**
 * Convenience — returns just the meta for headers and home screen cards.
 *
 *   const { label, Icon, orientationBadge } = getModeMeta(mode);
 */
export function getModeMeta(mode: string): ModeMeta {
  return getModeTheme(mode).meta;
}

/**
 * All registered mode keys in display order.
 * Used by the home screen to render the mode list without hardcoding strings.
 *
 *   const modes = getAllModes(); // ["headsup", "taboo", "forbidden"]
 */
export function getAllModes(): string[] {
  return Object.keys(MODE_THEMES);
}
