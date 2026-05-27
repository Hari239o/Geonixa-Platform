import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';

export type WarningRecord = {
  type: string;
  timestamp: number;
};

export type TerminationRecord = {
  reason: string;
  timestamp: number;
};

type ProctorState = {
  warnings: Record<string, number>;
  violationTimeline: WarningRecord[];
  termination?: TerminationRecord | null;
  setWarning: (type: string) => void;
  clearWarnings: () => void;
  setTermination: (reason: string) => void;
  clearTermination: () => void;
};

export const useProctorStore = create<ProctorState>()(
  persist(
    (set, get) => ({
      warnings: {},
      violationTimeline: [],
      termination: null,
      setWarning: (type: string) => {
        const now = Date.now();
        set((s) => {
          const count = (s.warnings[type] || 0) + 1;
          const timeline = s.violationTimeline.concat({ type, timestamp: now });
          return { warnings: { ...s.warnings, [type]: count }, violationTimeline: timeline };
        });
      },
      clearWarnings: () => set({ warnings: {} }),
      setTermination: (reason: string) => set({ termination: { reason, timestamp: Date.now() } }),
      clearTermination: () => set({ termination: null }),
    }),
    {
      name: 'proctor-store',
      storage: typeof window !== 'undefined' ? ({ 
        getItem: (key: string): StorageValue<ProctorState> | null => {
          try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: StorageValue<ProctorState>) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch {
            // Silently fail in privacy mode
          }
        },
        removeItem: (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {
            // Silently fail in privacy mode
          }
        }
      } as PersistStorage<ProctorState>) : undefined,
    }
  )
);
