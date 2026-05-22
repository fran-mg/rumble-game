interface GroqMessage {
  role: "system" | "user";
  content: string;
}

// Ordered fallback list: If your top choice hits a rate limit, it falls back to the next fastest models
const TARGET_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
];

export interface RouterPayload {
  deckName: string;
  cards: Array<{
    word: string;
    taboo: string[];
    difficulty: "easy" | "medium" | "hard";
  }>;
}

export const fetchAIWithFailover = async (
  category: string,
): Promise<RouterPayload> => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing variable allocation token: Confirm EXPO_PUBLIC_GROQ_API_KEY is defined inside your active local .env file.",
    );
  }

  const prompt = `You are an expert party game card designer. Create a custom word-guessing game card pack themed specifically around the category: "${category}".
  Generate exactly 8 highly relevant words or concepts. For each word, provide 4 strict "taboo" description words that players are forbidden from saying.
  Assign a balanced variety of difficulty settings ("easy", "medium", "hard").

  Return your complete response as a raw, single JSON object literal without markdown wrappers or code block strings. Use this identical format:
  {
    "deckName": "${category} Pack",
    "cards": [
      { "word": "Concept", "taboo": ["word1", "word2", "word3", "word4"], "difficulty": "medium" }
    ]
  }`;

  let lastError: any = null;

  // Waterfall pattern iteration loops
  for (const model of TARGET_MODELS) {
    try {
      console.log(`Attempting deck assembly via target model node: ${model}`);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content:
                  "You are an assistant that outputs strictly valid JSON objects without markdown fences.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }, // Enforces structured raw structural tracking parsing safety natively
          }),
        },
      );

      // Catch Rate Limits (HTTP 429) or token capacity exhausted states
      if (response.status === 429) {
        console.warn(
          `[429 Rate Limit hit] Model node ${model} saturated. Dropping to next fallback tier...`,
        );
        continue;
      }

      if (!response.ok) {
        const errPayload = await response.text();
        throw new Error(`HTTP Error state [${response.status}]: ${errPayload}`);
      }

      const rawJson = await response.json();
      const contentText = rawJson?.choices?.[0]?.message?.content;

      if (!contentText)
        throw new Error(
          `Empty tracking data tokens returned from model pipeline node: ${model}`,
        );

      const parsedResult: RouterPayload = JSON.parse(contentText.trim());
      return parsedResult;
    } catch (err: any) {
      console.error(
        `Error on model execution tier (${model}):`,
        err.message || err,
      );
      lastError = err;
      // Continue loop cycle down to backup nodes
    }
  }

  throw new Error(
    `All available cluster fallback models failed to complete request. Root cause: ${lastError?.message || "Unknown Network Exception"}`,
  );
};
