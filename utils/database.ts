import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Bump DB name to force fresh schema (dev only — use migrations in production)
const DB_NAME = "articulate_v3.db";

let db: SQLite.SQLiteDatabase | null = null;
if (Platform.OS !== "web") {
  db = SQLite.openDatabaseSync(DB_NAME);
}

export const initDatabase = async (): Promise<void> => {
  if (!db) return;
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("PRAGMA journal_mode = WAL;");

    const createQueries = [
      // ── DECKS ────────────────────────────────────────────────────────────────
      // Persisted permanently — user's card library
      `CREATE TABLE IF NOT EXISTS decks (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT    NOT NULL,
        category       TEXT,
        source         TEXT    DEFAULT 'bundled',
        description    TEXT,
        icon           TEXT    DEFAULT 'Layers',
        color          TEXT    DEFAULT '#3B82F6',
        created_at     INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at     INTEGER DEFAULT (strftime('%s', 'now')),
        is_favorited   INTEGER DEFAULT 0,
        download_count INTEGER DEFAULT 0,
        card_count     INTEGER DEFAULT 0
      );`,

      // ── CARDS ────────────────────────────────────────────────────────────────
      // Persisted permanently — belong to decks
      `CREATE TABLE IF NOT EXISTS cards (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id       INTEGER NOT NULL,
        word          TEXT    NOT NULL,
        taboo_words   TEXT,
        difficulty    TEXT    DEFAULT 'medium',
        hint          TEXT,
        is_hidden     INTEGER DEFAULT 0,
        times_played  INTEGER DEFAULT 0,
        times_guessed INTEGER DEFAULT 0,
        created_at    INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );`,

      // ── GAME MODES ───────────────────────────────────────────────────────────
      // Persisted — static lookup table, seeded once
      `CREATE TABLE IF NOT EXISTS game_modes (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT    NOT NULL UNIQUE,
        display_name TEXT    NOT NULL,
        description  TEXT,
        rules        TEXT,
        icon         TEXT,
        is_enabled   INTEGER DEFAULT 1
      );`,

      // ── GAMES ────────────────────────────────────────────────────────────────
      // One row per game session.
      //
      // participants_snapshot — JSON array of Participant objects captured at
      //   game-start. Keeps historical records readable after the Zustand store
      //   is cleared. Shape: { id, name, color, type }[]
      //
      // play_style — 'solo' | 'team'  (drives UI copy in stats screens)
      //
      // winning_participant_id — plain integer matching a participant's ephemeral
      //   id; no FK because participants are not a DB table.
      `CREATE TABLE IF NOT EXISTS games (
        id                     INTEGER PRIMARY KEY AUTOINCREMENT,
        mode_id                INTEGER NOT NULL,
        play_style             TEXT    NOT NULL DEFAULT 'team',
        status                 TEXT    DEFAULT 'active',
        started_at             INTEGER DEFAULT (strftime('%s', 'now')),
        ended_at               INTEGER,
        total_rounds           INTEGER DEFAULT 0,
        winning_participant_id INTEGER,
        participants_snapshot  TEXT    NOT NULL DEFAULT '[]',
        settings               TEXT,
        FOREIGN KEY (mode_id) REFERENCES game_modes(id)
      );`,

      // ── ROUNDS ───────────────────────────────────────────────────────────────
      // One row per turn.
      // participant_id matches Participant.id from the Zustand store /
      //   games.participants_snapshot — intentionally no FK constraint.
      `CREATE TABLE IF NOT EXISTS rounds (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id         INTEGER NOT NULL,
        round_number    INTEGER NOT NULL,
        participant_id  INTEGER NOT NULL,
        started_at      INTEGER DEFAULT (strftime('%s', 'now')),
        ended_at        INTEGER,
        cards_attempted INTEGER DEFAULT 0,
        cards_guessed   INTEGER DEFAULT 0,
        cards_passed    INTEGER DEFAULT 0,
        score           INTEGER DEFAULT 0,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      );`,

      // ── ROUND CARDS ──────────────────────────────────────────────────────────
      // Per-card result within a round — drives card statistics
      `CREATE TABLE IF NOT EXISTS round_cards (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id   INTEGER NOT NULL,
        card_id    INTEGER NOT NULL,
        result     TEXT,
        time_spent INTEGER,
        timestamp  INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id)  REFERENCES cards(id)
      );`,

      // ── SELECTED DECKS ───────────────────────────────────────────────────────
      // Persists the user's active deck selection across app restarts
      `CREATE TABLE IF NOT EXISTS selected_decks (
        deck_id     INTEGER PRIMARY KEY,
        selected_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );`,

      // ── BOARD STATE ──────────────────────────────────────────────────────────
      // Board game mode only. One row per game.
      //
      // participant_positions — JSON object keyed by participant id:
      //   { [participantId: number]: tileIndex }
      //   Replaces the old team_positions join table entirely.
      //
      // tile_categories — JSON string[]  maps tile index → category name
      `CREATE TABLE IF NOT EXISTS board_state (
        id                     INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id                INTEGER NOT NULL UNIQUE,
        board_size             INTEGER DEFAULT 48,
        current_tile           INTEGER DEFAULT 0,
        current_participant_id INTEGER,
        tile_categories        TEXT,
        participant_positions  TEXT    NOT NULL DEFAULT '{}',
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      );`,

      // ── SETTINGS ─────────────────────────────────────────────────────────────
      // Simple key-value user preferences
      `CREATE TABLE IF NOT EXISTS settings (
        key        TEXT    PRIMARY KEY,
        value      TEXT    NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );`,

      // ── INDICES ──────────────────────────────────────────────────────────────
      `CREATE INDEX IF NOT EXISTS idx_cards_deck_id  ON cards(deck_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cards_hidden   ON cards(is_hidden);`,
      `CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);`,
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

// ─── SEED ─────────────────────────────────────────────────────────────────────

const seedInitialData = async (): Promise<void> => {
  if (!db) return;
  try {
    const rows = await db.getAllAsync(
      "SELECT COUNT(*) as count FROM game_modes;",
    );
    const count = (rows[0] as { count: number }).count;

    if (count === 0) {
      await db.runAsync(`
        INSERT INTO game_modes (name, display_name, description, icon, is_enabled) VALUES
          ('articulate', 'Articulate', 'Describe the word without saying it.',         'MessageSquare', 1),
          ('taboo',      'Taboo',      'Describe without using forbidden words.',       'Ban',           1),
          ('charades',   'Charades',   'Act it out — no speaking allowed.',             'Smile',         1),
          ('password',   'Password',   'One-word clues to uncover the secret word.',   'Key',           1),
          ('boardgame',  'Board Game', 'Race along the track — category tiles decide.','Trophy',        1);
      `);
    }

    const defaults: { key: string; value: string }[] = [
      { key: "timer_duration", value: "60" },
      { key: "theme", value: "auto" },
      { key: "haptics_enabled", value: "true" },
      { key: "tilt_sensitivity", value: "medium" },
      { key: "sound_enabled", value: "true" },
      { key: "winning_score", value: "50" },
    ];
    for (const s of defaults) {
      await db.runAsync(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);",
        [s.key, s.value],
      );
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
};

// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

/**
 * A Participant is the single competitive unit in any game mode.
 *
 *   solo mode  → type = 'player'  (each person competes individually)
 *   team mode  → type = 'team'    (the team competes as one unit)
 *
 * The game engine treats both identically — scores, turns, and history
 * are all keyed by participant id regardless of type.
 */
export interface Participant {
  /** Locally generated (Date.now()-based). Not a DB primary key. */
  id: number;
  name: string;
  color: string;
  type: "player" | "team";
}

export interface DeckRow {
  id: number;
  name: string;
  category: string | null;
  source: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: number;
  updated_at: number;
  is_favorited: number;
  download_count: number;
  card_count: number;
}

export interface CardRow {
  id: number;
  deck_id: number;
  word: string;
  taboo_words: string | null; // stored as JSON string → parse to string[]
  difficulty: string;
  hint: string | null;
  is_hidden: number;
  times_played: number;
  times_guessed: number;
  created_at: number;
}

// ─── DB HELPERS ───────────────────────────────────────────────────────────────

export const dbHelpers = {
  // ── DECKS ──────────────────────────────────────────────────────────────────

  async getAllDecks(): Promise<DeckRow[]> {
    if (!db) return [];
    return db.getAllAsync(
      "SELECT * FROM decks ORDER BY is_favorited DESC, name ASC;",
    ) as Promise<DeckRow[]>;
  },

  async getSelectedDecks(): Promise<DeckRow[]> {
    if (!db) return [];
    return db.getAllAsync(
      "SELECT d.* FROM decks d INNER JOIN selected_decks s ON d.id = s.deck_id;",
    ) as Promise<DeckRow[]>;
  },

  async createDeck(
    name: string,
    category: string,
    source: string = "user-created",
    icon: string = "Layers",
    color: string = "#3B82F6",
    description: string = "",
  ): Promise<number | null> {
    if (!db) return null;
    const result = await db.runAsync(
      `INSERT INTO decks (name, category, source, icon, color, description)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [name, category, source, icon, color, description],
    );
    return result.lastInsertRowId;
  },

  async updateDeck(
    deckId: number,
    fields: Partial<
      Pick<
        DeckRow,
        "name" | "category" | "icon" | "color" | "description" | "is_favorited"
      >
    >,
  ): Promise<void> {
    if (!db) return;
    const entries = Object.entries(fields);
    if (entries.length === 0) return;
    const setClauses = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    await db.runAsync(
      `UPDATE decks SET ${setClauses}, updated_at = (strftime('%s', 'now')) WHERE id = ?;`,
      [...values, deckId],
    );
  },

  async deleteDeck(deckId: number): Promise<void> {
    if (!db) return;
    await db.runAsync("DELETE FROM decks WHERE id = ?;", [deckId]);
  },

  async toggleDeckSelection(deckId: number): Promise<void> {
    if (!db) return;
    const existing = await db.getFirstAsync(
      "SELECT deck_id FROM selected_decks WHERE deck_id = ?;",
      [deckId],
    );
    if (existing) {
      await db.runAsync("DELETE FROM selected_decks WHERE deck_id = ?;", [
        deckId,
      ]);
    } else {
      // BUG FIX: original code was missing `else` — always inserted
      await db.runAsync("INSERT INTO selected_decks (deck_id) VALUES (?);", [
        deckId,
      ]);
    }
  },

  async getSelectedDeckIds(): Promise<number[]> {
    if (!db) return [];
    const rows = (await db.getAllAsync(
      "SELECT deck_id FROM selected_decks;",
    )) as { deck_id: number }[];
    return rows.map((r) => r.deck_id);
  },

  // ── CARDS ──────────────────────────────────────────────────────────────────

  async getCardsForDeck(deckId: number): Promise<CardRow[]> {
    if (!db) return [];
    return db.getAllAsync(
      "SELECT * FROM cards WHERE deck_id = ? ORDER BY word ASC;",
      [deckId],
    ) as Promise<CardRow[]>;
  },

  async createCard(
    deckId: number,
    word: string,
    tabooWords: string[] = [],
    difficulty: string = "medium",
    hint: string = "",
  ): Promise<number | null> {
    if (!db) return null;
    const result = await db.runAsync(
      `INSERT INTO cards (deck_id, word, taboo_words, difficulty, hint)
       VALUES (?, ?, ?, ?, ?);`,
      [deckId, word, JSON.stringify(tabooWords), difficulty, hint],
    );
    await this._refreshDeckCardCount(deckId);
    return result.lastInsertRowId;
  },

  async updateCard(
    cardId: number,
    fields: Partial<
      Pick<
        CardRow,
        "word" | "taboo_words" | "difficulty" | "hint" | "is_hidden"
      >
    >,
  ): Promise<void> {
    if (!db) return;
    const entries = Object.entries(fields);
    if (entries.length === 0) return;
    const setClauses = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    await db.runAsync(`UPDATE cards SET ${setClauses} WHERE id = ?;`, [
      ...values,
      cardId,
    ]);
    const card = (await db.getFirstAsync(
      "SELECT deck_id FROM cards WHERE id = ?;",
      [cardId],
    )) as { deck_id: number } | null;
    if (card) await this._refreshDeckCardCount(card.deck_id);
  },

  async deleteCard(cardId: number): Promise<void> {
    if (!db) return;
    const card = (await db.getFirstAsync(
      "SELECT deck_id FROM cards WHERE id = ?;",
      [cardId],
    )) as { deck_id: number } | null;
    await db.runAsync("DELETE FROM cards WHERE id = ?;", [cardId]);
    if (card) await this._refreshDeckCardCount(card.deck_id);
  },

  async getShuffledCardsFromSelectedDecks(): Promise<CardRow[]> {
    if (!db) return [];
    return db.getAllAsync(`
      SELECT c.* FROM cards c
      INNER JOIN selected_decks s ON c.deck_id = s.deck_id
      WHERE c.is_hidden = 0
      ORDER BY RANDOM();
    `) as Promise<CardRow[]>;
  },

  /** Internal — keeps decks.card_count accurate after any card mutation */
  async _refreshDeckCardCount(deckId: number): Promise<void> {
    if (!db) return;
    await db.runAsync(
      `UPDATE decks
       SET card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = ? AND is_hidden = 0),
           updated_at = (strftime('%s', 'now'))
       WHERE id = ?;`,
      [deckId, deckId],
    );
  },

  // ── GAME SESSIONS ──────────────────────────────────────────────────────────

  /**
   * Creates a game session row and snapshots the participant list.
   * The snapshot means historical data stays readable even after the
   * Zustand store has been reset for a new game.
   */
  async createGame(
    modeId: number,
    playStyle: "solo" | "team",
    participants: Participant[],
    settings: Record<string, unknown>,
  ): Promise<number | null> {
    if (!db) return null;
    const result = await db.runAsync(
      `INSERT INTO games (mode_id, play_style, participants_snapshot, settings)
       VALUES (?, ?, ?, ?);`,
      [
        modeId,
        playStyle,
        JSON.stringify(participants),
        JSON.stringify(settings),
      ],
    );
    return result.lastInsertRowId;
  },

  async endGame(
    gameId: number,
    winningParticipantId: number | null,
  ): Promise<void> {
    if (!db) return;
    await db.runAsync(
      `UPDATE games
       SET status = 'completed',
           ended_at = (strftime('%s', 'now')),
           winning_participant_id = ?
       WHERE id = ?;`,
      [winningParticipantId, gameId],
    );
  },

  // ── ROUNDS ─────────────────────────────────────────────────────────────────

  async createRound(
    gameId: number,
    roundNumber: number,
    participantId: number,
  ): Promise<number | null> {
    if (!db) return null;
    const result = await db.runAsync(
      `INSERT INTO rounds (game_id, round_number, participant_id)
       VALUES (?, ?, ?);`,
      [gameId, roundNumber, participantId],
    );
    await db.runAsync(
      "UPDATE games SET total_rounds = total_rounds + 1 WHERE id = ?;",
      [gameId],
    );
    return result.lastInsertRowId;
  },

  async endRound(roundId: number, finalScore: number): Promise<void> {
    if (!db) return;
    await db.runAsync(
      `UPDATE rounds
       SET ended_at = (strftime('%s', 'now')), score = ?
       WHERE id = ?;`,
      [finalScore, roundId],
    );
  },

  async recordCardResult(
    roundId: number,
    cardId: number,
    result: "guessed" | "passed" | "skipped",
    timeSpent: number,
  ): Promise<void> {
    if (!db) return;
    await db.withTransactionAsync(async () => {
      await db!.runAsync(
        `INSERT INTO round_cards (round_id, card_id, result, time_spent)
         VALUES (?, ?, ?, ?);`,
        [roundId, cardId, result, timeSpent],
      );

      if (result === "guessed") {
        await db!.runAsync(
          `UPDATE rounds
           SET cards_attempted = cards_attempted + 1,
               cards_guessed   = cards_guessed   + 1,
               score           = score           + 1
           WHERE id = ?;`,
          [roundId],
        );
        await db!.runAsync(
          `UPDATE cards
           SET times_played  = times_played  + 1,
               times_guessed = times_guessed + 1
           WHERE id = ?;`,
          [cardId],
        );
      } else {
        await db!.runAsync(
          `UPDATE rounds
           SET cards_attempted = cards_attempted + 1,
               cards_passed    = cards_passed    + 1
           WHERE id = ?;`,
          [roundId],
        );
        await db!.runAsync(
          "UPDATE cards SET times_played = times_played + 1 WHERE id = ?;",
          [cardId],
        );
      }
    });
  },

  // ── BOARD STATE ────────────────────────────────────────────────────────────

  async initBoardState(
    gameId: number,
    participants: Participant[],
    tileCategories: string[],
    boardSize: number = 48,
  ): Promise<void> {
    if (!db) return;
    const positions: Record<number, number> = {};
    for (const p of participants) positions[p.id] = 0;

    await db.runAsync(
      `INSERT INTO board_state
         (game_id, board_size, tile_categories, participant_positions, current_participant_id)
       VALUES (?, ?, ?, ?, ?);`,
      [
        gameId,
        boardSize,
        JSON.stringify(tileCategories),
        JSON.stringify(positions),
        participants[0]?.id ?? null,
      ],
    );
  },

  async updateBoardPosition(
    gameId: number,
    participantId: number,
    newPosition: number,
    nextParticipantId: number,
  ): Promise<void> {
    if (!db) return;
    const row = (await db.getFirstAsync(
      "SELECT participant_positions FROM board_state WHERE game_id = ?;",
      [gameId],
    )) as { participant_positions: string } | null;
    if (!row) return;

    const positions: Record<number, number> = JSON.parse(
      row.participant_positions,
    );
    positions[participantId] = newPosition;

    await db.runAsync(
      `UPDATE board_state
       SET participant_positions = ?, current_participant_id = ?
       WHERE game_id = ?;`,
      [JSON.stringify(positions), nextParticipantId, gameId],
    );
  },

  async getBoardState(gameId: number) {
    if (!db) return null;
    return db.getFirstAsync("SELECT * FROM board_state WHERE game_id = ?;", [
      gameId,
    ]);
  },

  // ── SETTINGS ───────────────────────────────────────────────────────────────

  async getSetting(key: string): Promise<string | null> {
    if (!db) return null;
    const result = (await db.getFirstAsync(
      "SELECT value FROM settings WHERE key = ?;",
      [key],
    )) as { value: string } | null;
    return result?.value ?? null;
  },

  async setSetting(key: string, value: string): Promise<void> {
    if (!db) return;
    await db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE
       SET value = excluded.value, updated_at = (strftime('%s', 'now'));`,
      [key, value],
    );
  },

  // ── STATISTICS ─────────────────────────────────────────────────────────────

  async getCardStats(limit: number = 20) {
    if (!db) return [];
    return db.getAllAsync(
      `SELECT word, times_played, times_guessed,
              CASE WHEN times_played > 0
                   THEN ROUND(times_guessed * 100.0 / times_played, 1)
                   ELSE 0
              END as success_rate
       FROM cards
       WHERE times_played > 0
       ORDER BY times_played DESC
       LIMIT ?;`,
      [limit],
    );
  },
};

export default db;
