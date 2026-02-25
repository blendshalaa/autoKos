import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing } from '../types/definitions';

interface CompareState {
    items: Listing[];
    addItem: (item: Listing) => void;
    removeItem: (id: string) => void;
    clear: () => void;
    isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const current = get().items;
                if (current.find(i => i.id === item.id)) return;
                if (current.length >= 3) return;
                set({ items: [...current, item] });
            },
            removeItem: (id) => {
                set({ items: get().items.filter(i => i.id !== id) });
            },
            clear: () => {
                set({ items: [] });
            },
            isInCompare: (id) => {
                return !!get().items.find(i => i.id === id);
            }
        }),
        {
            name: 'compare-storage',
        }
    )
);
