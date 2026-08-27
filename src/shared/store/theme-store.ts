import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "app-seguro-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

// O valor inicial só lê o que o script inline de index.html já aplicou no
// <html> (mesma chave) — não reaplica a classe no mount, pra não fazer um
// segundo write redundante no DOM logo depois do primeiro paint.
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light",
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
}));
