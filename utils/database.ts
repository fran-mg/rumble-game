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

    // Execute queries one by one
    const createQueries = [
      `CREATE TABLE IF NOT EXISTS decks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT, source TEXT DEFAULT 'bundled', description TEXT, icon TEXT, created_at INTEGER DEFAULT (strftime('%s', 'now')), updated_at INTEGER DEFAULT (strftime('%s', 'now')), is_favorited INTEGER DEFAULT 0, download_count INTEGER DEFAULT 0, card_count INTEGER DEFAULT 0);`,
      `CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY AUTOINCREMENT, deck_id INTEGER NOT NULL, word TEXT NOT NULL, taboo_words TEXT, difficulty TEXT DEFAULT 'medium', hint TEXT, is_hidden INTEGER DEFAULT 0, times_played INTEGER DEFAULT 0, times_guessed INTEGER DEFAULT 0, created_at INTEGER DEFAULT (strftime('%s', 'now')), FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS game_modes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, description TEXT, rules TEXT, icon TEXT, is_enabled INTEGER DEFAULT 1);`,
      `CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT DEFAULT '#3B82F6', icon TEXT, created_at INTEGER DEFAULT (strftime('%s', 'now')));`,
      `CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, mode_id INTEGER NOT NULL, started_at INTEGER DEFAULT (strftime('%s', 'now')), ended_at INTEGER, total_rounds INTEGER DEFAULT 0, winning_team_id INTEGER, settings TEXT, FOREIGN KEY (mode_id) REFERENCES game_modes(id), FOREIGN KEY (winning_team_id) REFERENCES teams(id));`,
      `CREATE TABLE IF NOT EXISTS game_teams (game_id INTEGER NOT NULL, team_id INTEGER NOT NULL, final_score INTEGER DEFAULT 0, position INTEGER, PRIMARY KEY (game_id, team_id), FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS rounds (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL, round_number INTEGER NOT NULL, team_id INTEGER NOT NULL, started_at INTEGER DEFAULT (strftime('%s', 'now')), ended_at INTEGER, cards_attempted INTEGER DEFAULT 0, cards_guessed INTEGER DEFAULT 0, cards_passed INTEGER DEFAULT 0, score INTEGER DEFAULT 0, FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id));`,
      `CREATE TABLE IF NOT EXISTS round_cards (id INTEGER PRIMARY KEY AUTOINCREMENT, round_id INTEGER NOT NULL, card_id INTEGER NOT NULL, result TEXT, time_spent INTEGER, timestamp INTEGER DEFAULT (strftime('%s', 'now')), FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE, FOREIGN KEY (card_id) REFERENCES cards(id));`,
      `CREATE TABLE IF NOT EXISTS selected_decks (deck_id INTEGER PRIMARY KEY, selected_at INTEGER DEFAULT (strftime('%s', 'now')), FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS board_state (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL UNIQUE, board_size INTEGER DEFAULT 48, current_tile INTEGER DEFAULT 0, current_team_id INTEGER, tile_categories TEXT, FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE, FOREIGN KEY (current_team_id) REFERENCES teams(id));`,
      `CREATE TABLE IF NOT EXISTS team_positions (id INTEGER PRIMARY KEY AUTOINCREMENT, board_state_id INTEGER NOT NULL, team_id INTEGER NOT NULL, position INTEGER DEFAULT 0, FOREIGN KEY (board_state_id) REFERENCES board_state(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER DEFAULT (strftime('%s', 'now')));`,
      `CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cards_hidden ON cards(is_hidden);`,
    ];

    for (const query of createQueries) {
      await db.execAsync(query);
    }

    await seedInitialData();
  } catch (error) {
    console.error("X Database initialization error:", error);
    throw error;
  }
};

const seedInitialData = async () => {
  if (!db) return;
  try {
    const existingModes = await db.getAllAsync(
      "SELECT COUNT(*) as count FROM game_modes",
    );
    const count = (existingModes[0] as any).count;

    if (count === 0) {
      await db.runAsync(`INSERT INTO game_modes (name, display_name, description, is_enabled) VALUES 
        ('articulate', 'Articulate', 'Describe the word', 1), 
        ('taboo', 'Taboo', 'No taboo words', 1), 
        ('charades', 'Charades', 'Act it out', 1), 
        ('password', 'Password', 'One word clues', 1), 
        ('boardgame', 'Board Game', 'Track game', 1)`);
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
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
        [setting.key, setting.value],
      );
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
};

export const dbHelpers = {
  async getAllDecks() {
    if (!db) return [];
    return await db.getAllAsync(
      "SELECT * FROM decks ORDER BY is_favorited DESC, name ASC",
    );
  },
  async createDeck(
    name: string,
    category: string,
    source: string = "user-created",
  ) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO decks (name, category, source) VALUES (?, ?, ?)",
      [name, category, source],
    );
    return result.lastInsertRowId;
  },
  async createCard(
    deckId: number,
    word: string,
    tabooWords: string[],
    difficulty: string = "medium",
  ) {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO cards (deck_id, word, taboo_words, difficulty) VALUES (?, ?, ?, ?)",
      [deckId, word, JSON.stringify(tabooWords), difficulty],
    );
    await db.runAsync(
      "UPDATE decks SET card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = ? AND is_hidden = 0) WHERE id = ?",
      [deckId, deckId],
    );
    return result.lastInsertRowId;
  },
  async getAllTeams() {
    if (!db) return [];
    return await db.getAllAsync("SELECT * FROM teams ORDER BY created_at ASC");
  },
  async createTeam(name: string, color: string = "#3B82F6", icon: string = "") {
    if (!db) return null;
    const result = await db.runAsync(
      "INSERT INTO teams (name, color, icon) VALUES (?, ?, ?)",
      [name, color, icon],
    );
    return result.lastInsertRowId;
  },
  async getSetting(key: string): Promise<string | null> {
    if (!db) return null;
    const result = await db.getFirstAsync(
      "SELECT value FROM settings WHERE key = ?",
      [key],
    );
    return result ? (result as any).value : null;
  },
};

export default db;
