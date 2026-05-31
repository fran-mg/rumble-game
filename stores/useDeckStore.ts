// stores/useDeckStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dbHelpers, DeckRow } from "../utils/database";

export interface Deck {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  cardCount: number;
}

export interface Card {
  id: number;
  deck_id: number;
  word: string;
  taboo_words: string | null;
  difficulty: string;
  hint: string | null;
  is_hidden: number;
  times_played: number;
  times_guessed: number;
  created_at: number;
}

// ── Store interface ───────────────────────────────────────────────────────────

interface DeckState {
  decks: Deck[];
  selectedDeckIds: string[];
  currentCards: Card[];

  loadDecks: () => Promise<void>;
  selectDeck: (deckId: string) => void;
  deselectDeck: (deckId: string) => void;
  toggleDeckSelection: (deckId: string) => void;
  selectAllDecks: () => void;
  deselectAllDecks: () => void;
  loadCardsForSelectedDecks: () => Promise<void>;
  createDeck: (name: string, category: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
}

// ── Helper ────────────────────────────────────────────────────────────────────
// DeckRow is a superset of Deck; pick only the public fields so the store
// never leaks internal DB columns (source, is_favorited, etc.) into UI code.

function toPublicDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    icon: row.icon,
    color: row.color,
    url: row.url,
    cardCount: row.cardCount,
  };
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [],
      selectedDeckIds: [],
      currentCards: [],

      // ── Load ───────────────────────────────────────────────────────────────
      loadDecks: async () => {
        const rows = await dbHelpers.getAllDecks();
        set({ decks: rows.map(toPublicDeck) });
      },

      // ── Selection ──────────────────────────────────────────────────────────
      selectDeck: (deckId: string) => {
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.includes(deckId)
            ? state.selectedDeckIds
            : [...state.selectedDeckIds, deckId],
        }));
      },

      deselectDeck: (deckId: string) => {
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.filter((id) => id !== deckId),
        }));
      },

      toggleDeckSelection: (deckId: string) => {
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

      deselectAllDecks: () => {
        set({ selectedDeckIds: [] });
      },

      // ── Cards ──────────────────────────────────────────────────────────────
      loadCardsForSelectedDecks: async () => {
        const { selectedDeckIds } = get();
        if (selectedDeckIds.length === 0) {
          set({ currentCards: [] });
          return;
        }
        // DB still uses integer PKs internally; coerce once here at the boundary
        const numericIds = selectedDeckIds
          .map((id) => Number(id))
          .filter((n) => !Number.isNaN(n) && n > 0);

        const cards = (await dbHelpers.getShuffledCardsFromDecks(
          numericIds,
        )) as Card[];
        set({ currentCards: cards });
      },

      // ── Mutations ──────────────────────────────────────────────────────────
      createDeck: async (name: string, category: string) => {
        await dbHelpers.createDeck(name, category, "user-created");
        await get().loadDecks();
      },

      deleteDeck: async (deckId: string) => {
        await dbHelpers.deleteDeck(Number(deckId));
        set((state) => ({
          selectedDeckIds: state.selectedDeckIds.filter((id) => id !== deckId),
        }));
        await get().loadDecks();
      },
    }),
    {
      name: "deck-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the selection — decks are always re-hydrated from SQLite
      partialize: (state) => ({ selectedDeckIds: state.selectedDeckIds }),
    },
  ),
);
