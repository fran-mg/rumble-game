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
    // 1. Fetch the actual deck JSON
    const response = await fetch(deckItem.url);
    if (!response.ok) throw new Error("Failed to fetch deck file");
    const deckData = await response.json();

    // 2. Insert into local SQLite database using a transaction for speed
    await db.withTransactionAsync(async () => {
      const deckId = await dbHelpers.createDeck(
        deckData.name,
        deckData.category,
        "community", // Source
        deckData.icon || "DownloadCloud",
        deckData.color || "#3B82F6",
        deckData.description || "",
      );

      if (deckId && deckData.cards) {
        for (const card of deckData.cards) {
          await dbHelpers.createCard(
            deckId,
            card.word,
            card.taboo_words || [],
            card.difficulty || "medium",
            card.hint || "",
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
