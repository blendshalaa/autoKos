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
                if (current.length >= 3) {
                    // Remove oldest (first) if full, or prevent? Usually replace or warn.
                    // Requirement says "select 2-3 cars". Let's limit to 3.
                    // If full, we'll replace the oldest one or just not add. 
                    // Let's replace the first one (FIFO) to keep it simple, or just alert?
                    // Better UX: Don't add if full and warn (component side). 
                    // But store should probably just allow adding up to limit.
                    // I will strictly cap at 3.
                    if (current.length >= 3) return;
                }
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
