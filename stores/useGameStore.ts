import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GameMode = "headsup" | "taboo" | "password";
export type ScoringStyle = "rounds" | "boardgame";
export type PlayStyle = "single" | "team";
type CardResult = "guessed" | "passed";

interface MatchPlayer {
  id: string;
  name: string;
  teamId?: string; // null if single player
}

interface MatchTeam {
  id: string;
  name: string;
  color: string;
}

interface TurnHistory {
  cardId: number;
  word: string;
  result: CardResult;
}

interface GameState {
  // Settings
  mode: GameMode;
  scoringStyle: ScoringStyle;
  playStyle: PlayStyle;
  targetLimit: number | "Infinity"; // Rounds count OR Tile count
  timerDuration: number;

  // Roster
  matchTeams: MatchTeam[];
  matchPlayers: MatchPlayer[];

  // Match State
  isPlaying: boolean;
  isPaused: boolean;
  currentRound: number;
  currentTurnIndex: number; // Index of the player/team currently playing

  // Scoring (roundNum -> entityId -> score)
  roundScores: Record<number, Record<string, number>>;
  turnHistory: TurnHistory[];
  turnScore: number;
  turnPasses: number;

  // Deck State
  cardsInRound: any[];
  currentCardIndex: number;

  // Actions
  setupMatch: (config: Partial<GameState>) => void;
  updateSettingsMidGame: (config: Partial<GameState>) => void;
  startTurn: () => void;
  endTurn: () => void;
  endMatch: () => void;
  recordCardResult: (cardId: number, word: string, result: CardResult) => void;
  nextCard: () => void;
  setPaused: (paused: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: "headsup",
      scoringStyle: "rounds",
      playStyle: "team",
      targetLimit: 3,
      timerDuration: 60,

      matchTeams: [],
      matchPlayers: [],

      isPlaying: false,
      isPaused: false,
      currentRound: 1,
      currentTurnIndex: 0,

      roundScores: {},
      turnHistory: [],
      turnScore: 0,
      turnPasses: 0,

      cardsInRound: [],
      currentCardIndex: 0,

      setupMatch: (config) => {
        set({
          ...config,
          isPlaying: true,
          currentRound: 1,
          currentTurnIndex: 0,
          roundScores: {},
          turnHistory: [],
        });
      },

      updateSettingsMidGame: (config) => {
        set({ ...config });
      },

      startTurn: () => {
        set({
          currentCardIndex: 0,
          turnScore: 0,
          turnPasses: 0,
          turnHistory: [],
          isPaused: false,
        });
      },

      endTurn: () => {
        const {
          currentRound,
          currentTurnIndex,
          turnScore,
          roundScores,
          playStyle,
          matchTeams,
          matchPlayers,
        } = get();

        // Determine who just played
        const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;
        const currentEntity = activeRoster[currentTurnIndex];

        // Save score for this round & entity
        const newRoundScores = { ...roundScores };
        if (!newRoundScores[currentRound]) newRoundScores[currentRound] = {};
        newRoundScores[currentRound][currentEntity.id] = turnScore;

        set({ roundScores: newRoundScores });
      },

      endMatch: () => {
        set({ isPlaying: false, currentRound: 1, currentTurnIndex: 0 });
      },

      recordCardResult: (cardId, word, result) => {
        const { turnHistory, turnScore, turnPasses } = get();
        set({
          turnHistory: [...turnHistory, { cardId, word, result }],
          turnScore: result === "guessed" ? turnScore + 1 : turnScore,
          turnPasses: result === "passed" ? turnPasses + 1 : turnPasses,
        });
      },

      nextCard: () => {
        set((state) => ({ currentCardIndex: state.currentCardIndex + 1 }));
      },

      setPaused: (paused) => set({ isPaused: paused }),
    }),
    {
      name: "game-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        timerDuration: state.timerDuration,
        scoringStyle: state.scoringStyle,
        playStyle: state.playStyle,
      }),
    },
  ),
);
