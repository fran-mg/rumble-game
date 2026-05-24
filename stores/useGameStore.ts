import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GameMode = "headsup" | "taboo" | "password";
export type ScoringStyle = "rounds" | "boardgame";
export type PlayStyle = "single" | "team";
type CardResult = "guessed" | "passed";

export interface MatchPlayer {
  id: number;
  name: string;
  teamId: number;
}

export interface MatchTeam {
  id: number;
  name: string;
  color: string;
}

interface TurnHistory {
  cardId: number;
  word: string;
  result: CardResult;
  isEdited: boolean;
}

interface GameState {
  mode: GameMode;
  scoringStyle: ScoringStyle;
  playStyle: PlayStyle;
  targetLimit: number | "Infinity";
  timerDuration: number;

  matchTeams: MatchTeam[];
  matchPlayers: MatchPlayer[];

  isPlaying: boolean;
  isPaused: boolean;
  currentRound: number;
  currentTurnIndex: number;

  roundScores: Record<number, Record<number, number>>;
  turnHistory: TurnHistory[];
  turnScore: number;
  turnPasses: number;

  cardsInRound: any[];
  currentCardIndex: number;

  setupMatch: (config: Partial<GameState>) => void;
  updateSettingsMidGame: (config: Partial<GameState>) => void;
  startTurn: () => void;
  endTurn: () => void;
  endMatch: () => void;
  recordCardResult: (cardId: number, word: string, result: CardResult) => void;
  toggleHistoryResult: (index: number) => void;
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

      updateSettingsMidGame: (config) => set({ ...config }),

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
        const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;
        const currentEntity = activeRoster[currentTurnIndex];

        const newRoundScores = { ...roundScores };
        if (!newRoundScores[currentRound]) newRoundScores[currentRound] = {};
        newRoundScores[currentRound][currentEntity.id] = turnScore;

        set({ roundScores: newRoundScores });
      },

      endMatch: () =>
        set({ isPlaying: false, currentRound: 1, currentTurnIndex: 0 }),

      recordCardResult: (cardId, word, result) => {
        const { turnHistory, turnScore, turnPasses } = get();
        set({
          turnHistory: [
            ...turnHistory,
            { cardId, word, result, isEdited: false },
          ],
          turnScore: result === "guessed" ? turnScore + 1 : turnScore,
          turnPasses: result === "passed" ? turnPasses + 1 : turnPasses,
        });
      },

      toggleHistoryResult: (index: number) => {
        const { turnHistory, turnScore, turnPasses } = get();
        const newHistory = [...turnHistory];
        const item = newHistory[index];

        if (item.result === "guessed") {
          item.result = "passed";
          set({ turnScore: turnScore - 1, turnPasses: turnPasses + 1 });
        } else {
          item.result = "guessed";
          set({ turnScore: turnScore + 1, turnPasses: turnPasses - 1 });
        }
        item.isEdited = true;
        set({ turnHistory: newHistory });
      },

      nextCard: () =>
        set((state) => ({ currentCardIndex: state.currentCardIndex + 1 })),
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
