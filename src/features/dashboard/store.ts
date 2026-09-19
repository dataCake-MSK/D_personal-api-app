import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { WidgetConfig, WidgetInstance } from './types';

export const DASHBOARD_STORAGE_KEY = 'dashboard';

type DashboardState = {
  widgets: WidgetInstance[];
  addWidget: (type: string, config?: WidgetConfig) => WidgetInstance;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  updateWidgetConfig: (id: string, config: WidgetConfig) => void;
  reset: () => void;
};

function createWidgetId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function moved(widgets: WidgetInstance[], id: string, direction: 'up' | 'down') {
  const from = widgets.findIndex((w) => w.id === id);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= widgets.length) return widgets;

  const next = [...widgets];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],

      addWidget: (type, config = {}) => {
        const widget: WidgetInstance = { id: createWidgetId(), type, config };
        set({ widgets: [...get().widgets, widget] });
        return widget;
      },

      removeWidget: (id) => set({ widgets: get().widgets.filter((w) => w.id !== id) }),

      moveWidget: (id, direction) => set({ widgets: moved(get().widgets, id, direction) }),

      updateWidgetConfig: (id, config) =>
        set({
          widgets: get().widgets.map((w) => (w.id === id ? { ...w, config } : w)),
        }),

      reset: () => set({ widgets: [] }),
    }),
    {
      name: DASHBOARD_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ widgets: state.widgets }),
    },
  ),
);
