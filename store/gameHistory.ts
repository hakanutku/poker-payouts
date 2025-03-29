import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameHistory = {
  id: string;
  date: string | Date;
  players: {
    name: string;
    buyIn: number;
    cashOut: number;
  }[];
  expenses?: {
    title?: string;
    amount: number;
    payer: string;
  }[];
  payments: {
    from: string;
    to: string;
    amount: number;
  }[];
};

type GameHistoryStore = {
  games: GameHistory[];
  addGame: (game: GameHistory) => void;
  clearHistory: () => void;
};

export const useGameHistory = create<GameHistoryStore>()(
  persist(
    (set) => ({
      games: [],
      addGame: (game) => set((state) => ({ games: [game, ...state.games] })),
      clearHistory: () => set({ games: [] }),
    }),
    {
      name: 'poker-payouts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);