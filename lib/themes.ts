export const THEMES = {
  What2Watch: {
    name: "W2W Signature",
    accent: "#E50914",
    bg: "#0f0f10",
    glow: "rgba(229,9,20,0.35)",
    text: "#ffffff",
  },

  spotify: {
    name: "Spotify Mode",
    accent: "#1DB954",
    bg: "#030806",
    glow: "rgba(29,185,84,0.3)",
    text: "#000000",
  },

  imdb: {
    name: "IMDb Mode",
    accent: "#F5C518",
    bg: "#070604",
    glow: "rgba(245,197,24,0.3)",
    text: "#000000",
  },

  midnight: {
    name: "Midnight Mode",
    accent: "#818CF8",
    bg: "#050513",
    glow: "rgba(129,140,248,0.3)",
    text: "#ffffff",
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

export function getSavedTheme(): ThemeKey {
  if (typeof window === "undefined") return "What2Watch";

  const saved = localStorage.getItem("What2WatchTheme") as ThemeKey | null;

  if (saved && saved in THEMES) {
    return saved;
  }

  return "What2Watch";
}

export function saveTheme(theme: ThemeKey) {
  if (typeof window === "undefined") return;

  localStorage.setItem("What2WatchTheme", theme);
}