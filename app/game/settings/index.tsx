import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../../stores/useDeckStore";
import {
  PlayStyle,
  ScoringStyle,
  useGameStore,
} from "../../../stores/useGameStore";
import { useRosterStore } from "../../../stores/useRosterStore";
import { Participant } from "../../../utils/database";
import DeckSelector from "./_DeckSelector";
import ParticipantSelector from "./_ParticipantSelector";
import ScoringStyleSelector from "./_ScoringStyleSelector";
import TimerSelector from "./_TimerSelector";

// Suppress known harmless warning from react-native-draggable-flatlist
LogBox.ignoreLogs([
  "Warning: ref.measureLayout must be called with a ref to a native component",
]);

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMode = (params.mode as any) || "articulate";

  const { decks, selectedDeckIds, loadDecks, toggleDeckSelection } =
    useDeckStore();
  const gameStore = useGameStore();
  const { participants, initRoster } = useRosterStore();

  const scrollRef = useRef<any>(null);

  // Cache to remember participants when switching between Solo and Team styles
  const cachedTeamsRef = useRef<Participant[] | null>(null);
  const cachedSolosRef = useRef<Participant[] | null>(null);

  const [scoringStyle, setScoringStyle] = useState<ScoringStyle>("rounds");
  const [targetLimit, setTargetLimit] = useState<number | "Infinity">(3);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("team");
  const [timerDuration, setTimerDuration] = useState(60);
  const [isDecksExpanded, setIsDecksExpanded] = useState(false);

  useEffect(() => {
    loadDecks();
    initRoster("team");
    // Ensure caches are wiped clean on fresh page loads
    cachedTeamsRef.current = null;
    cachedSolosRef.current = null;
  }, []);

  // ── Settings handlers ──────────────────────────────────────────────────────

  const handlePlayStyleChange = (style: PlayStyle) => {
    if (style === playStyle) return;

    // 1. Save the CURRENT participants into the appropriate cache
    const currentParticipants = useRosterStore.getState().participants;
    if (playStyle === "team") {
      cachedTeamsRef.current = currentParticipants;
    } else {
      cachedSolosRef.current = currentParticipants;
    }

    // 2. Switch the style
    setPlayStyle(style);

    // 3. Load from cache if it exists, otherwise initialize fresh ones
    if (style === "team") {
      if (cachedTeamsRef.current) {
        useRosterStore.setState({ participants: cachedTeamsRef.current });
      } else {
        initRoster("team");
      }
    } else {
      if (cachedSolosRef.current) {
        useRosterStore.setState({ participants: cachedSolosRef.current });
      } else {
        initRoster("solo");
      }
    }
  };

  const handleScoringStyleChange = (style: ScoringStyle) => {
    setScoringStyle(style);
    if (style === "rounds") {
      setTargetLimit((prev) =>
        prev !== "Infinity" ? Math.min(20, Math.max(1, prev)) : 3,
      );
    } else {
      setTargetLimit((prev) =>
        prev !== "Infinity" ? Math.min(30, Math.max(5, prev)) : 30,
      );
    }
  };

  // ── Keyboard Auto-Scroll Handler ───────────────────────────────────────────

  const handleScrollRequest = (yPos: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: yPos, animated: true });
    }, 300);
  };

  // ── Start game ─────────────────────────────────────────────────────────────

  const handleStartGame = async () => {
    await useDeckStore.getState().loadCardsForSelectedDecks();
    const cards = useDeckStore.getState().currentCards;

    if (cards.length === 0) {
      Alert.alert("No Cards", "Please select at least one deck with cards.");
      setIsDecksExpanded(true);
      return;
    }

    const namedParticipants = participants.filter(
      (p) => p.name.trim().length > 0,
    );

    if (namedParticipants.length < 2) {
      Alert.alert(
        "Not enough participants",
        `You need at least 2 ${playStyle === "team" ? "teams" : "players"}.`,
      );
      return;
    }

    gameStore.setupMatch({
      mode: selectedMode,
      scoringStyle,
      playStyle,
      targetLimit,
      timerDuration,
      participants: namedParticipants,
      cardsInRound: cards,
    });

    router.replace("/game/play");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const namedCount = participants.filter((p) => p.name.trim()).length;
  const participantLabel = playStyle === "team" ? "Teams" : "Players";

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <NestableScrollContainer
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-black text-white tracking-tight mb-6">
            Match Setup
          </Text>

          <ScoringStyleSelector
            scoringStyle={scoringStyle}
            onScoringStyleChange={handleScoringStyleChange}
            targetLimit={targetLimit}
            onTargetLimitChange={setTargetLimit}
          />

          <ParticipantSelector
            playStyle={playStyle}
            onPlayStyleChange={handlePlayStyleChange}
            onScrollRequest={handleScrollRequest}
          />

          <DeckSelector
            decks={decks}
            selectedDeckIds={selectedDeckIds}
            isDecksExpanded={isDecksExpanded}
            setIsDecksExpanded={setIsDecksExpanded}
            toggleDeckSelection={toggleDeckSelection}
          />

          <TimerSelector
            timerDuration={timerDuration}
            setTimerDuration={setTimerDuration}
          />
        </NestableScrollContainer>
      </KeyboardAvoidingView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/95 border-t border-slate-900 pointer-events-none">
        <TouchableOpacity
          onPress={handleStartGame}
          className="bg-emerald-600 rounded-2xl p-4 items-center shadow-lg pointer-events-auto"
        >
          <Text className="text-white font-black text-xl tracking-wide uppercase">
            Start Game
          </Text>
          <Text className="text-emerald-200 text-xs mt-1 font-medium">
            {namedCount} {participantLabel} •{" "}
            {scoringStyle === "rounds"
              ? targetLimit === "Infinity"
                ? "∞ Rounds"
                : `${targetLimit} Rounds`
              : `${targetLimit} Tiles`}{" "}
            • {timerDuration}s
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
