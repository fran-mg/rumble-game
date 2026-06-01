import db, { dbHelpers } from "./database";

export interface CloudDeckIndexItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  cardCount: number;
}

// JSON shape of an individual downloaded deck file
interface CloudDeckCard {
  id: string;
  word: string;
  tabooWords: string[];
  charadesHint?: string;
  passwordHint?: string;
}

interface CloudDeckFile {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  difficulty: string;
  tags: string[];
  cardCount: number;
  cards: CloudDeckCard[];
}

const INDEX_URL =
  "https://raw.githubusercontent.com/fran-mg/articulate-decks/main/decks-index.json";

export const fetchCloudDecksIndex = async (): Promise<CloudDeckIndexItem[]> => {
  try {
    const response = await fetch(INDEX_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.decks || [];
  } catch (error) {
    console.error("Failed to fetch decks index:", error);
    throw error;
  }
};

export const downloadAndImportDeck = async (
  deckItem: CloudDeckIndexItem,
): Promise<boolean> => {
  if (!db) return false;
  try {
    const response = await fetch(deckItem.url);
    if (!response.ok) throw new Error("Failed to fetch deck file");
    const deckData = (await response.json()) as CloudDeckFile;

    await db.withTransactionAsync(async () => {
      const deckId = await dbHelpers.createDeck(
        deckData.name,
        deckData.category,
        "community",
        deckData.icon || "DownloadCloud",
        deckData.color || "#6366f1",
        deckData.description || "",
      );

      if (deckId && deckData.cards) {
        for (const card of deckData.cards) {
          await dbHelpers.createCard(
            deckId,
            card.word,
            card.tabooWords,
            card.charadesHint ?? "",
            card.passwordHint ?? "",
          );
        }
      }
    });

    return true;
  } catch (error) {
    console.error(
      `Failed to download and import deck ${deckItem.name}:`,
      error,
    );
    return false;
  }
};
