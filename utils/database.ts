import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const DB_NAME = "articulate_final_v1.db";

let db: SQLite.SQLiteDatabase | null = null;
if (Platform.OS !== "web") {
  db = SQLite.openDatabaseSync(DB_NAME);
}

export const initDatabase = async (): Promise<void> => {
  if (!db) return;

  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    const createQueries = [
      `CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        category TEXT, 
        source TEXT DEFAULT 'bundled', 
        description TEXT, 
        icon TEXT DEFAULT 'Layers', 
        created_at INTEGER DEFAULT (strftime('%s', 'now')), 
        updated_at INTEGER DEFAULT (strftime('%s', 'now')), 
        is_favorited INTEGER DEFAULT 0, 
        download_count INTEGER DEFAULT 0, 
        card_count INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        deck_id INTEGER NOT NULL, 
        word TEXT NOT NULL, 
        taboo_words TEXT, 
        difficulty TEXT DEFAULT 'medium', 
        hint TEXT, 
        is_hidden INTEGER DEFAULT 0, 
        times_played INTEGER DEFAULT 0, 
        times_guessed INTEGER DEFAULT 0, 
        created_at INTEGER DEFAULT (strftime('%s', 'now')), 
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS game_modes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL UNIQUE, 
        display_name TEXT NOT NULL, 
        description TEXT, 
        rules TEXT, 
        icon TEXT, 
        is_enabled INTEGER DEFAULT 1
      );`,
      `CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        color TEXT DEFAULT '#3B82F6', 
        icon TEXT DEFAULT 'Users', 
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );`,
      `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        mode_id INTEGER NOT NULL, 
        started_at INTEGER DEFAULT (strftime('%s', 'now')), 
        ended_at INTEGER, 
        total_rounds INTEGER DEFAULT 0, 
        winning_team_id INTEGER, 
        settings TEXT, 
        FOREIGN KEY (mode_id) REFERENCES game_modes(id), 
        FOREIGN KEY (winning_team_id) REFERENCES teams(id)
      );`,
      `CREATE TABLE IF NOT EXISTS game_teams (
        game_id INTEGER NOT NULL, 
        team_id INTEGER NOT NULL, 
        final_score INTEGER DEFAULT 0, 
        position INTEGER, 
        PRIMARY KEY (game_id, team_id), 
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, 
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        game_id INTEGER NOT NULL, 
        round_number INTEGER NOT NULL, 
        team_id INTEGER NOT NULL, 
        started_at INTEGER DEFAULT (strftime('%s', 'now')), 
        ended_at INTEGER, 
        cards_attempted INTEGER DEFAULT 0, 
        cards_guessed INTEGER DEFAULT 0, 
        cards_passed INTEGER DEFAULT 0, 
        score INTEGER DEFAULT 0, 
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, 
        FOREIGN KEY (team_id) REFERENCES teams(id)
      );`,
      `CREATE TABLE IF NOT EXISTS round_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        round_id INTEGER NOT NULL, 
        card_id INTEGER NOT NULL, 
        result TEXT, 
        time_spent INTEGER, 
        timestamp INTEGER DEFAULT (strftime('%s', 'now')), 
        FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE, 
        FOREIGN KEY (card_id) REFERENCES cards(id)
      );`,
      `CREATE TABLE IF NOT EXISTS selected_decks (
        deck_id INTEGER PRIMARY KEY, 
        selected_at INTEGER DEFAULT (strftime('%s', 'now')), 
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS board_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        game_id INTEGER NOT NULL UNIQUE, 
        board_size INTEGER DEFAULT 48, 
        current_tile INTEGER DEFAULT 0, 
        current_team_id INTEGER, 
        tile_categories TEXT, 
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, 
        FOREIGN KEY (current_team_id) REFERENCES teams(id)
      );`,
      `CREATE TABLE IF NOT EXISTS team_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        board_state_id INTEGER NOT NULL, 
        team_id INTEGER NOT NULL, 
        position INTEGER DEFAULT 0, 
        FOREIGN KEY (board_state_id) REFERENCES board_state(id) ON DELETE CASCADE, 
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, 
        value TEXT NOT NULL, 
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );`,
      `CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cards_hidden ON cards(is_hidden);`,
    ];

    for (const query of createQueries) {
      await db.execAsync(query);
    }

    await seedInitialData();
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

const seedInitialData = async () => {
  if (!db) return;
  try {
    const existingModes = await db.getAllAsync(
      "SELECT COUNT(*) as count FROM game_modes;",
    );
    const count = (existingModes[0] as any).count;

    if (count === 0) {
      await db.runAsync(`INSERT INTO game_modes (name, display_name, description, icon, is_enabled) VALUES 
        ('articulate', 'Articulate', 'Describe the word fast without saying it.', 'MessageSquare', 1), 
        ('taboo', 'Taboo', 'Describe the word without using any forbidden terms.', 'Ban', 1), 
        ('charades', 'Charades', 'Act out the phrase without speaking a word.', 'Smile', 1), 
        ('password', 'Password', 'Uncover the secret word using one-word clues.', 'Key', 1), 
        ('boardgame', 'Board Game', 'Race along the physical path track to victory.', 'Trophy', 1);`);
    }

    const defaultSettings = [
      { key: "timer_duration", value: "60" },
      { key: "theme", value: "auto" },
      { key: "haptics_enabled", value: "true" },
      { key: "tilt_sensitivity", value: "medium" },
      { key: "sound_enabled", value: "true" },
      { key: "winning_score", value: "50" },
    ];

    for (const setting of defaultSettings) {
      await db.runAsync(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);",
        [setting.key, setting.value],
      );
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
};

export const dbHelpers = {
  // --- DECK OPERATIONS ---
  async getAllDecks() {
    if (!db) return [];
    return await db.getAllAsync(
      "SELECT * FROM decks ORDER BY is_favorited DESC, name ASC;",
    );
  },

  async getSelectedDecks() {
    if (!db) return [];
    return await db.getAllAsync(
      "SELECT d.* FROM decks d INNER JOIN selected_decks s ON d.id = s.deck_id;",
    );
  },

  async createDeck(
    name: string,
    category: string,
    source: string = "user-created",
    icon: string = "Layers",
  ) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO decks (name, category, source, icon) VALUES (?, ?, ?, ?);",
      [name, category, source, icon],
    );
    return result.lastInsertRowId;
  },

  async deleteDeck(deckId: number) {
    if (!db) return;
    await db.runAsync("DELETE FROM decks WHERE id = ?;", [deckId]);
  },

  async toggleDeckSelection(deckId: number) {
    if (!db) return;
    const existing = await db.getFirstAsync(
      "SELECT deck_id FROM selected_decks WHERE deck_id = ?;",
      [deckId],
    );
    if (existing) {
      await db.runAsync("DELETE FROM selected_decks WHERE deck_id = ?;", [
        deckId,
      ]);
    }
    {
      await db.runAsync("INSERT INTO selected_decks (deck_id) VALUES (?);", [
        deckId,
      ]);
    }
  },

  // --- CARD OPERATIONS ---
  async createCard(
    deckId: number,
    word: string,
    tabooWords: string[],
    difficulty: string = "medium",
  ) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO cards (deck_id, word, taboo_words, difficulty) VALUES (?, ?, ?, ?);",
      [deckId, word, JSON.stringify(tabooWords), difficulty],
    );
    await db.runAsync(
      "UPDATE decks SET card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = ? AND is_hidden = 0) WHERE id = ?;",
      [deckId, deckId],
    );
    return result.lastInsertRowId;
  },

  async getShuffledCardsFromSelectedDecks() {
    if (!db) return [];
    return await db.getAllAsync(`
      SELECT c.* FROM cards c 
      INNER JOIN selected_decks s ON c.deck_id = s.deck_id 
      WHERE c.is_hidden = 0 
      ORDER BY RANDOM();
    `);
  },

  // --- TEAM OPERATIONS ---
  async getAllTeams() {
    if (!db) return [];
    return await db.getAllAsync("SELECT * FROM teams ORDER BY created_at ASC;");
  },

  async createTeam(
    name: string,
    color: string = "#3B82F6",
    icon: string = "Users",
  ) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO teams (name, color, icon) VALUES (?, ?, ?);",
      [name, color, icon],
    );
    return result.lastInsertRowId;
  },

  async updateTeam(teamId: number, name: string, color: string, icon: string) {
    if (!db) return;
    await db.runAsync(
      "UPDATE teams SET name = ?, color = ?, icon = ? WHERE id = ?;",
      [name, color, icon, teamId],
    );
  },

  async deleteTeam(teamId: number) {
    if (!db) return;
    await db.runAsync("DELETE FROM teams WHERE id = ?;", [teamId]);
  },

  // --- GAMEPLAY SESSION TRACKING ---
  async createGame(modeId: number, teamIds: number[], settings: any) {
    if (!db) return null;
    let gameId: number | null = null;

    // Execute atomically across cross-tables via transactional wrapper
    await db.withTransactionAsync(async () => {
      const res = await db!.runAsync(
        "INSERT INTO games (mode_id, settings) VALUES (?, ?);",
        [modeId, JSON.stringify(settings)],
      );
      gameId = res.lastInsertRowId;

      for (const teamId of teamIds) {
        await db!.runAsync(
          "INSERT INTO game_teams (game_id, team_id) VALUES (?, ?);",
          [gameId, teamId],
        );
      }
    });
    return gameId;
  },

  async createRound(gameId: number, roundNumber: number, teamId: number) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO rounds (game_id, round_number, team_id) VALUES (?, ?, ?);",
      [gameId, roundNumber, teamId],
    );
    return result.lastInsertRowId;
  },

  async recordCardResult(
    roundId: number,
    cardId: number,
    result: "guessed" | "passed" | "skipped",
    timeSpent: number,
  ) {
    if (!db) return;
    await db.withTransactionAsync(async () => {
      await db!.runAsync(
        "INSERT INTO round_cards (round_id, card_id, result, time_spent) VALUES (?, ?, ?, ?);",
        [roundId, cardId, result, timeSpent],
      );

      await db!.runAsync(
        "UPDATE rounds SET cards_attempted = cards_attempted + 1, " +
          (result === "guessed"
            ? "cards_guessed = cards_guessed + 1, score = score + 1 "
            : "cards_passed = cards_passed + 1 ") +
          "WHERE id = ?;",
        [roundId],
      );

      if (result === "guessed") {
        await db!.runAsync(
          "UPDATE cards SET times_played = times_played + 1, times_guessed = times_guessed + 1 WHERE id = ?;",
          [cardId],
        );
      } else {
        await db!.runAsync(
          "UPDATE cards SET times_played = times_played + 1 WHERE id = ?;",
          [cardId],
        );
      }
    });
  },

  async endRound(roundId: number, finalScore: number) {
    if (!db) return;
    await db.runAsync(
      "UPDATE rounds SET ended_at = (strftime('%s', 'now')), score = ? WHERE id = ?;",
      [finalScore, roundId],
    );
  },

  // --- GENERAL SETTINGS ---
  async getSetting(key: string): Promise<string | null> {
    if (!db) return null;
    const result = await db.getFirstAsync(
      "SELECT value FROM settings WHERE key = ?;",
      [key],
    );
    return result ? (result as any).value : null;
  },
};

export default db;
