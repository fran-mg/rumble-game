import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dbHelpers } from "../utils/database";

type GameMode = "articulate" | "taboo" | "charades" | "password" | "boardgame";
type CardResult = "guessed" | "passed" | "skipped";

interface GameState {
  // Game session
  gameId: number | null;
  roundId: number | null;
  mode: GameMode;
  isPlaying: boolean;
  isPaused: boolean;

  // Round state
  currentRound: number;
  currentCardIndex: number;
  cardsInRound: any[];

  // Timer
  timerDuration: number;
  timeRemaining: number;

  // Scores
  roundScore: number;
  passesUsed: number;
  passLimit: number;

  // Settings
  tiltEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;

  // Actions
  startGame: (mode: GameMode, teamIds: number[]) => Promise<void>;
  endGame: () => Promise<void>;
  startRound: (teamId: number, cards: any[]) => Promise<void>;
  endRound: () => Promise<void>;

  recordCardResult: (
    cardId: number,
    result: CardResult,
    timeSpent: number,
  ) => Promise<void>;
  nextCard: () => void;

  setTimerDuration: (duration: number) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;

  setPaused: (paused: boolean) => void;
  toggleTilt: () => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameId: null,
      roundId: null,
      mode: "articulate",
      isPlaying: false,
      isPaused: false,

      currentRound: 1,
      currentCardIndex: 0,
      cardsInRound: [],

      timerDuration: 60,
      timeRemaining: 60,

      roundScore: 0,
      passesUsed: 0,
      passLimit: 3,

      tiltEnabled: true,
      hapticsEnabled: true,
      soundEnabled: true,

      // Start a new game
      startGame: async (mode: GameMode, teamIds: number[]) => {
        const modeId = {
          articulate: 1,
          taboo: 2,
          charades: 3,
          password: 4,
          boardgame: 5,
        }[mode];

        const gameId = await dbHelpers.createGame(modeId, teamIds, {
          timerDuration: get().timerDuration,
          passLimit: get().passLimit,
        });

        set({
          gameId,
          mode,
          isPlaying: true,
          currentRound: 1,
          currentCardIndex: 0,
        });
      },

      // End the current game
      endGame: async () => {
        const { gameId } = get();
        if (gameId) {
          // End game will be called with winning team later
          set({
            gameId: null,
            roundId: null,
            isPlaying: false,
            currentRound: 1,
            currentCardIndex: 0,
          });
        }
      },

      // Start a new round
      startRound: async (teamId: number, cards: any[]) => {
        const { gameId, currentRound } = get();
        if (!gameId) return;

        const roundId = await dbHelpers.createRound(
          gameId,
          currentRound,
          teamId,
        );

        set({
          roundId,
          cardsInRound: cards,
          currentCardIndex: 0,
          roundScore: 0,
          passesUsed: 0,
          timeRemaining: get().timerDuration,
          isPaused: false,
        });
      },

      // End the current round
      endRound: async () => {
        const { roundId, roundScore } = get();
        if (roundId) {
          await dbHelpers.endRound(roundId, roundScore);
        }

        set((state) => ({
          roundId: null,
          currentRound: state.currentRound + 1,
          currentCardIndex: 0,
          isPaused: false,
        }));
      },

      // Record result for a card
      recordCardResult: async (
        cardId: number,
        result: CardResult,
        timeSpent: number,
      ) => {
        const { roundId } = get();
        if (!roundId) return;

        await dbHelpers.recordCardResult(roundId, cardId, result, timeSpent);

        if (result === "guessed") {
          set((state) => ({ roundScore: state.roundScore + 1 }));
        } else if (result === "passed") {
          set((state) => ({ passesUsed: state.passesUsed + 1 }));
        }
      },

      // Move to next card
      nextCard: () => {
        set((state) => ({
          currentCardIndex: state.currentCardIndex + 1,
        }));
      },

      // Timer controls
      setTimerDuration: (duration: number) => {
        set({ timerDuration: duration, timeRemaining: duration });
      },

      setTimeRemaining: (time: number) => {
        set({ timeRemaining: time });
      },

      decrementTime: () => {
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining - 1),
        }));
      },

      // Game controls
      setPaused: (paused: boolean) => {
        set({ isPaused: paused });
      },

      // Settings toggles
      toggleTilt: () => {
        set((state) => ({ tiltEnabled: !state.tiltEnabled }));
      },

      toggleHaptics: () => {
        set((state) => ({ hapticsEnabled: !state.hapticsEnabled }));
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist settings, not active game state
        timerDuration: state.timerDuration,
        passLimit: state.passLimit,
        tiltEnabled: state.tiltEnabled,
        hapticsEnabled: state.hapticsEnabled,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
