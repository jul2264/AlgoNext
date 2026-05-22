// AlgoNext — UI Store

import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme (future use — dark mode is the default)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Global loading overlay
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  commandPaletteOpen: false,
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
}));
