import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dbHelpers } from "../utils/database";

interface Deck {
  id: number;
  name: string;
  category: string;
  source: string;
  card_count: number;
  is_favorited: number;
}

interface Card {
  id: number;
  deck_id: number;
  word: string;
  taboo_words: string;
  difficulty: string;
  is_hidden: number;
}

interface DeckState {
  decks: Deck[];
  selectedDeckIds: number[];
  currentCards: Card[];

  loadDecks: () => Promise<void>;
  selectDeck: (deckId: number) => void;
  deselectDeck: (deckId: number) => void;
  toggleDeckSelection: (deckId: number) => void;
  selectAllDecks: () => void;
  loadCardsForSelectedDecks: () => Promise<void>;
  createDeck: (name: string, category: string) => Promise<void>;
  deleteDeck: (deckId: number) => Promise<void>;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [],
      selectedDeckIds: [],
      currentCards: [],

      loadDecks: async () => {
        const decks = (await dbHelpers.getAllDecks()) as Deck[];
        set({ decks });
      },

      selectDeck: (deckId: number) => {
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.includes(deckId)
            ? state.selectedDeckIds
            : [...state.selectedDeckIds, deckId],
        }));
      },

      deselectDeck: (deckId: number) => {
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.filter((id) => id !== deckId),
        }));
      },

      toggleDeckSelection: (deckId: number) => {
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.includes(deckId)
            ? state.selectedDeckIds.filter((id) => id !== deckId)
            : [...state.selectedDeckIds, deckId],
        }));
      },

      selectAllDecks: () => {
        set((state) => ({
          selectedDeckIds: state.decks.map((d) => d.id),
        }));
      },

      loadCardsForSelectedDecks: async () => {
        const { selectedDeckIds } = get();
        if (selectedDeckIds.length === 0) {
          set({ currentCards: [] });
          return;
        }

        const cards = (await dbHelpers.getShuffledCardsFromDecks(
          selectedDeckIds,
        )) as Card[];
        set({ currentCards: cards });
      },

      createDeck: async (name: string, category: string) => {
        await dbHelpers.createDeck(name, category, "user-created");
        await get().loadDecks();
      },

      deleteDeck: async (deckId: number) => {
        await dbHelpers.deleteDeck(deckId);
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.filter((id) => id !== deckId),
        }));
        await get().loadDecks();
      },
    }),
    {
      name: "deck-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedDeckIds: state.selectedDeckIds }),
    },
  ),
);
