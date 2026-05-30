export const MODE_ACCENT: Record<
  string,
  {
    color: string;
    colorMuted: string;
    colorBg: string;
    colorBorder: string;
    label: string;
  }
> = {
  headsup: {
    color: "#6366f1",
    colorMuted: "#c7d2fe",
    colorBg: "rgba(99,102,241,0.12)",
    colorBorder: "rgba(99,102,241,0.35)",
    label: "HEADS UP",
  },
  taboo: {
    color: "#0891b2",
    colorMuted: "#a5f3fc",
    colorBg: "rgba(8,145,178,0.12)",
    colorBorder: "rgba(8,145,178,0.35)",
    label: "TABOO",
  },
  forbidden: {
    color: "#e11d48",
    colorMuted: "#fecdd3",
    colorBg: "rgba(225,29,72,0.12)",
    colorBorder: "rgba(225,29,72,0.35)",
    label: "FORBIDDEN",
  },
  articulate: {
    color: "#2563eb",
    colorMuted: "#bfdbfe",
    colorBg: "rgba(37,99,235,0.12)",
    colorBorder: "rgba(37,99,235,0.35)",
    label: "ARTICULATE",
  },
};

export const DEFAULT_ACCENT = MODE_ACCENT.articulate;
