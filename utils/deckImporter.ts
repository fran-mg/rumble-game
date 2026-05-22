import db, { dbHelpers } from "./database";

interface StarterCard {
  word: string;
  taboo_words: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface StarterDeck {
  name: string;
  category: string;
  icon: string;
  cards: StarterCard[];
}

const STARTER_DECKS: StarterDeck[] = [
  {
    name: "Global Landmarks",
    category: "Geography",
    icon: "Globe",
    cards: [
      {
        word: "Eiffel Tower",
        taboo_words: ["Paris", "France", "Tower", "Metal"],
        difficulty: "easy",
      },
      {
        word: "Statue of Liberty",
        taboo_words: ["New York", "America", "Green", "Torch"],
        difficulty: "easy",
      },
      {
        word: "Machu Picchu",
        taboo_words: ["Peru", "Inca", "Mountains", "Ruins"],
        difficulty: "hard",
      },
      {
        word: "Colosseum",
        taboo_words: ["Rome", "Italy", "Gladiator", "Arena"],
        difficulty: "medium",
      },
    ],
  },
  {
    name: "Sci-Fi & Fantasy",
    category: "Entertainment",
    icon: "Tv",
    cards: [
      {
        word: "Darth Vader",
        taboo_words: ["Star Wars", "Anakin", "Helmet", "Luke"],
        difficulty: "easy",
      },
      {
        word: "Hogwarts",
        taboo_words: ["Harry Potter", "Magic", "School", "Castle"],
        difficulty: "medium",
      },
      {
        word: "Matrix",
        taboo_words: ["Neo", "Pill", "Simulation", "Morpheus"],
        difficulty: "hard",
      },
    ],
  },
  {
    name: "Stem Cell & Cosmos",
    category: "Science",
    icon: "Atom",
    cards: [
      {
        word: "Black Hole",
        taboo_words: ["Space", "Gravity", "Light", "Singularity"],
        difficulty: "medium",
      },
      {
        word: "DNA",
        taboo_words: ["Helix", "Genes", "Genetic", "Code"],
        difficulty: "easy",
      },
      {
        word: "Photosynthesis",
        taboo_words: ["Plants", "Sunlight", "Green", "Oxygen"],
        difficulty: "medium",
      },
    ],
  },
];

export const seedStarterDecksIfEmpty = async (): Promise<void> => {
  if (!db) return;
  try {
    const existingDecks = await db.getAllAsync(
      "SELECT COUNT(*) as count FROM decks;",
    );
    const count = (existingDecks[0] as any).count;

    if (count === 0) {
      await db.withTransactionAsync(async () => {
        for (const starter of STARTER_DECKS) {
          const deckId = await dbHelpers.createDeck(
            starter.name,
            starter.category,
            "bundled",
            starter.icon,
          );
          if (deckId) {
            for (const card of starter.cards) {
              await dbHelpers.createCard(
                deckId,
                card.word,
                card.taboo_words,
                card.difficulty,
              );
            }
          }
        }
      });
      console.log("Starter decks securely compiled and injected.");
    }
  } catch (error) {
    console.error("Failed to seed starter packs:", error);
  }
};
