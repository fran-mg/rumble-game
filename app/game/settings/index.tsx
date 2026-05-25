import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../../stores/useDeckStore";
import {
  PlayStyle,
  ScoringStyle,
  useGameStore,
} from "../../../stores/useGameStore";
import { useRosterStore } from "../../../stores/useRosterStore";
import DeckSelector from "./_DeckSelector";
import MatchSetupHeader from "./_MatchSetupHeader";
import PlayerSelector from "./_PlayerSelector";
import TimerSelector from "./_TimerSelector";

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMode = (params.mode as any) || "headsup";

  const { decks, selectedDeckIds, loadDecks, toggleDeckSelection } =
    useDeckStore();
  const gameStore = useGameStore();
  const { participants, initRoster } = useRosterStore();

  const [scoringStyle, setScoringStyle] = useState<ScoringStyle>("rounds");
  const [targetLimit, setTargetLimit] = useState<number | "Infinity">(3);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("team");
  const [timerDuration, setTimerDuration] = useState(60);
  const [isDecksExpanded, setIsDecksExpanded] = useState(false);

  useEffect(() => {
    loadDecks();
    initRoster(playStyle);
  }, []);

  // Re-initialise roster when play style switches so defaults make sense
  const handlePlayStyleChange = (style: PlayStyle) => {
    setPlayStyle(style);
    initRoster(style);
  };

  const handleScoringStyleChange = (style: ScoringStyle) => {
    setScoringStyle(style);
    if (style === "rounds")
      setTargetLimit((prev) =>
        prev !== "Infinity" ? Math.min(20, Math.max(1, prev)) : 3,
      );
    if (style === "boardgame")
      setTargetLimit((prev) =>
        prev !== "Infinity" ? Math.min(30, Math.max(5, prev)) : 30,
      );
  };

  const handleStartGame = async () => {
    await useDeckStore.getState().loadCardsForSelectedDecks();
    const cards = useDeckStore.getState().currentCards;

    if (cards.length === 0) {
      Alert.alert("No Cards", "Please select at least one deck with cards.");
      setIsDecksExpanded(true);
      return;
    }

    // Validate — every participant must have a non-empty name
    const namedParticipants = participants.filter(
      (p) => p.name.trim().length > 0,
    );

    if (namedParticipants.length < 2) {
      Alert.alert(
        "Not enough players",
        `You need at least 2 ${playStyle === "team" ? "teams" : "players"} to start.`,
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

  const participantLabel = playStyle === "team" ? "Teams" : "Players";
  const namedCount = participants.filter(
    (p) => p.name.trim().length > 0,
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          <MatchSetupHeader
            scoringStyle={scoringStyle}
            handleScoringStyleChange={handleScoringStyleChange}
            targetLimit={targetLimit}
            setTargetLimit={setTargetLimit}
            playStyle={playStyle}
            setPlayStyle={handlePlayStyleChange}
          />

          <PlayerSelector playStyle={playStyle} />

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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky start button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/95 border-t border-slate-900">
        <TouchableOpacity
          onPress={handleStartGame}
          className="bg-emerald-600 rounded-2xl p-4 items-center shadow-lg"
        >
          <Text className="text-white font-black text-xl tracking-wide uppercase">
            Start Game
          </Text>
          <Text className="text-emerald-200 text-xs mt-1 font-medium">
            {namedCount} {participantLabel} •{" "}
            {scoringStyle === "rounds"
              ? `${targetLimit} Rounds`
              : `${targetLimit} Tiles`}{" "}
            • {timerDuration}s
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
