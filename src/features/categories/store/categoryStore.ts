import { create } from 'zustand';
import type { Category, CategoryStats } from '../../../shared/types/common.types';

export interface XpGainAnimation {
  id: string;
  categoryName: string;
  categoryColor: string;
  xpAmount: number;
  timestamp: number;
}

interface CategoryStore {
  categories: Category[];
  categoryStats: CategoryStats[];
  activeXpGains: XpGainAnimation[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  setCategoryStats: (stats: CategoryStats[]) => void;
  addXpGainAnimation: (animation: XpGainAnimation) => void;
  removeXpGainAnimation: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  categoryStats: [],
  activeXpGains: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),
  setCategoryStats: (categoryStats) => set({ categoryStats }),
  addXpGainAnimation: (animation) => set((state) => ({
    activeXpGains: [...state.activeXpGains, animation]
  })),
  removeXpGainAnimation: (id) => set((state) => ({
    activeXpGains: state.activeXpGains.filter((a) => a.id !== id)
  })),
}));
