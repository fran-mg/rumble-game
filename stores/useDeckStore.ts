import { create } from "zustand";
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

  // Actions
  loadDecks: () => Promise<void>;
  selectDeck: (deckId: number) => Promise<void>;
  deselectDeck: (deckId: number) => Promise<void>;
  toggleDeckSelection: (deckId: number) => Promise<void>;
  loadCardsForSelectedDecks: () => Promise<void>;
  createDeck: (name: string, category: string) => Promise<void>;
  deleteDeck: (deckId: number) => Promise<void>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  selectedDeckIds: [],
  currentCards: [],

  loadDecks: async () => {
    const decks = await dbHelpers.getAllDecks();
    const selectedDecks = await dbHelpers.getSelectedDecks();
    set({
      decks,
      selectedDeckIds: selectedDecks.map((d: any) => d.id),
    });
  },

  selectDeck: async (deckId: number) => {
    await dbHelpers.toggleDeckSelection(deckId);
    const selectedDecks = await dbHelpers.getSelectedDecks();
    set({ selectedDeckIds: selectedDecks.map((d: any) => d.id) });
  },

  deselectDeck: async (deckId: number) => {
    await dbHelpers.toggleDeckSelection(deckId);
    const selectedDecks = await dbHelpers.getSelectedDecks();
    set({ selectedDeckIds: selectedDecks.map((d: any) => d.id) });
  },

  toggleDeckSelection: async (deckId: number) => {
    await dbHelpers.toggleDeckSelection(deckId);
    const selectedDecks = await dbHelpers.getSelectedDecks();
    set({ selectedDeckIds: selectedDecks.map((d: any) => d.id) });
  },

  loadCardsForSelectedDecks: async () => {
    const cards = await dbHelpers.getShuffledCardsFromSelectedDecks();
    set({ currentCards: cards });
  },

  createDeck: async (name: string, category: string) => {
    await dbHelpers.createDeck(name, category, "user-created");
    await get().loadDecks();
  },

  deleteDeck: async (deckId: number) => {
    await dbHelpers.deleteDeck(deckId);
    await get().loadDecks();
  },
}));
