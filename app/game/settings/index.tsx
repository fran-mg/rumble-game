import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
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
import MatchSetupHeader from "./_MatchSetupHeader";
import {
  PlayerSelectorFooter,
  PlayerSelectorHeader,
  RosterItem,
} from "./_PlayerSelector";
import TimerSelector from "./_TimerSelector";

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMode = (params.mode as any) || "articulate";

  const { decks, selectedDeckIds, loadDecks, toggleDeckSelection } =
    useDeckStore();
  const gameStore = useGameStore();
  const {
    participants,
    initRoster,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    reorderParticipants,
  } = useRosterStore();

  const [scoringStyle, setScoringStyle] = useState<ScoringStyle>("rounds");
  const [targetLimit, setTargetLimit] = useState<number | "Infinity">(3);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("team");
  const [timerDuration, setTimerDuration] = useState(60);
  const [isDecksExpanded, setIsDecksExpanded] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const isNewItemRef = useRef(false);

  useEffect(() => {
    loadDecks();
    initRoster("team");
  }, []);

  const handlePlayStyleChange = (style: PlayStyle) => {
    setPlayStyle(style);
    initRoster(style);
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

  // ── Edit lifecycle ─────────────────────────────────────────────────────────

  const label = playStyle === "solo" ? "Player" : "Team";

  const handleBeginEdit = (id: number, currentName: string) => {
    isNewItemRef.current = currentName === "";
    setEditingId(id);
    setEditName(currentName);
  };

  const handleConfirmEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert(
        "Name required",
        `Please give this ${label.toLowerCase()} a name.`,
      );
      return;
    }
    updateParticipant(editingId!, trimmed);
    setEditingId(null);
    isNewItemRef.current = false;
  };

  const handleCancelEdit = (id: number) => {
    if (isNewItemRef.current) {
      deleteParticipant(id);
    }
    setEditingId(null);
    isNewItemRef.current = false;
  };

  const handleDelete = (id: number) => {
    if (participants.length <= 1) {
      Alert.alert(
        "Can't remove",
        `You need at least one ${label.toLowerCase()}.`,
      );
      return;
    }
    deleteParticipant(id);
  };

  const handleAdd = () => {
    addParticipant(playStyle);
    setTimeout(() => {
      const latest = useRosterStore.getState().participants.at(-1);
      if (latest) handleBeginEdit(latest.id, "");
    }, 30);
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
        "Not enough players",
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

  const renderItem = (params: RenderItemParams<Participant>) => (
    <RosterItem
      {...params}
      playStyle={playStyle}
      editingId={editingId}
      editName={editName}
      setEditName={setEditName}
      onBeginEdit={handleBeginEdit}
      onConfirmEdit={handleConfirmEdit}
      onCancelEdit={handleCancelEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* 
          Single DraggableFlatList renders participants AND scrolls the page.
          No nested lists = no gesture conflicts with the slider.
        */}
        <DraggableFlatList
          data={participants}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorderParticipants(data)}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          activationDistance={8}
          ListHeaderComponent={
            <>
              <MatchSetupHeader
                scoringStyle={scoringStyle}
                handleScoringStyleChange={handleScoringStyleChange}
                targetLimit={targetLimit}
                setTargetLimit={setTargetLimit}
                playStyle={playStyle}
                setPlayStyle={handlePlayStyleChange}
              />
              <PlayerSelectorHeader
                playStyle={playStyle}
                participantCount={participants.length}
              />
            </>
          }
          ListFooterComponent={
            <>
              <PlayerSelectorFooter playStyle={playStyle} onAdd={handleAdd} />
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
            </>
          }
        />
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
