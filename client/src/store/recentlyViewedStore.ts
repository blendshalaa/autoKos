import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
    ids: string[];
    addId: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            ids: [],
            addId: (id) => {
                const current = get().ids;
                // Remove if exists to move to top
                const filtered = current.filter(i => i !== id);
                // Add to beginning, limit to 10
                set({ ids: [id, ...filtered].slice(0, 10) });
            },
        }),
        {
            name: 'recently-viewed-storage',
        }
    )
);
