import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { dbHelpers } from "./database";

export interface GenerationResult {
  success: boolean;
  deckId?: number;
  error?: string;
}

export const generateDeckViaAI = async (
  categoryName: string,
  apiKey: string,
): Promise<GenerationResult> => {
  if (!categoryName.trim())
    return { success: false, error: "Category name is blank." };
  if (!apiKey.trim())
    return { success: false, error: "Missing OpenAI API credentials." };

  try {
    const prompt = `You are a professional party game card designer. Create a custom word-guessing game card pack themed specifically around the category: "${categoryName}".
    Generate exactly 8 highly relevant words or concepts. For each word, provide 4 strict "taboo" description words that players are forbidden from saying.
    Assign a balanced variety of difficulty settings ("easy", "medium", "hard").

    Return your complete response as a raw, single JSON object literal without markdown wrappers or code block strings. Use this identical format:
    {
      "deckName": "Theme Title Here",
      "cards": [
        { "word": "Concept", "taboo": ["word1", "word2", "word3", "word4"], "difficulty": "medium" }
      ]
    }`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const parsedData = JSON.parse(text.trim());

    // Write straight to persistent device memory tables
    const deckId = await dbHelpers.createDeck(
      parsedData.deckName || categoryName,
      categoryName,
      "ai-generated",
      "Sparkles",
    );

    if (deckId) {
      for (const card of parsedData.cards) {
        await dbHelpers.createCard(
          deckId,
          card.word,
          card.taboo || [],
          card.difficulty || "medium",
        );
      }
      return { success: true, deckId };
    }

    return {
      success: false,
      error: "Database rejected deck generation allocation.",
    };
  } catch (error: any) {
    console.error("AI Generation Engine Failure:", error);
    return {
      success: false,
      error: error?.message || "Unknown error during parsing.",
    };
  }
};
