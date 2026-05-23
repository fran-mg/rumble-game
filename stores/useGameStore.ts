import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GameMode = "headsup" | "taboo" | "password";
type CardResult = "guessed" | "passed" | "skipped";

interface TurnHistory {
  cardId: number;
  word: string;
  result: CardResult;
}

interface GameState {
  mode: GameMode;
  isPlaying: boolean;
  isPaused: boolean;

  // Match Configuration
  teamsInGame: any[];
  totalRounds: number;
  currentRound: number;
  currentTeamIndex: number;

  // Scoring
  matchScores: Record<number, number>; // teamId -> score
  turnHistory: TurnHistory[];

  // Turn State
  cardsInRound: any[];
  currentCardIndex: number;
  timerDuration: number;
  timeRemaining: number;
  turnScore: number;
  turnPasses: number;

  // Settings
  tiltEnabled: boolean;

  // Actions
  setupMatch: (
    mode: GameMode,
    teams: any[],
    duration: number,
    cards: any[],
  ) => void;
  startTurn: () => void;
  endTurn: () => void;
  endMatch: () => void;
  recordCardResult: (cardId: number, word: string, result: CardResult) => void;
  nextCard: () => void;
  decrementTime: () => void;
  setPaused: (paused: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: "headsup",
      isPlaying: false,
      isPaused: false,

      teamsInGame: [],
      totalRounds: 1,
      currentRound: 1,
      currentTeamIndex: 0,

      matchScores: {},
      turnHistory: [],

      cardsInRound: [],
      currentCardIndex: 0,
      timerDuration: 15,
      timeRemaining: 15,
      turnScore: 0,
      turnPasses: 0,

      tiltEnabled: true,

      setupMatch: (mode, teams, duration, cards) => {
        const initialScores: Record<number, number> = {};
        teams.forEach((t) => (initialScores[t.id] = 0));

        set({
          mode,
          teamsInGame: teams,
          totalRounds: 1, // Fixed for this test
          currentRound: 1,
          currentTeamIndex: 0,
          matchScores: initialScores,
          cardsInRound: cards, // In a real app, chunk this per turn
          timerDuration: duration,
          isPlaying: true,
        });
      },

      startTurn: () => {
        set({
          timeRemaining: get().timerDuration,
          currentCardIndex: 0,
          turnScore: 0,
          turnPasses: 0,
          turnHistory: [],
          isPaused: false,
        });
      },

      endTurn: () => {
        const {
          currentTeamIndex,
          teamsInGame,
          turnScore,
          matchScores,
          currentRound,
          totalRounds,
        } = get();
        const currentTeam = teamsInGame[currentTeamIndex];

        // Update total score for this team
        set({
          matchScores: {
            ...matchScores,
            [currentTeam.id]: matchScores[currentTeam.id] + turnScore,
          },
        });
      },

      endMatch: () => {
        set({ isPlaying: false, teamsInGame: [] });
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

      decrementTime: () => {
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining - 1),
        }));
      },

      setPaused: (paused) => set({ isPaused: paused }),
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tiltEnabled: state.tiltEnabled }),
    },
  ),
);
