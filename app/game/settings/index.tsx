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
import DeckSelector from "./_DeckSelector";
import MatchSetupHeader from "./_MatchSetupHeader";
import RosterItem from "./_RosterItem";
import TimerSelector from "./_TimerSelector";

export type ListItem =
  | { type: "team"; id: number; name: string; color: string }
  | { type: "player"; id: number; name: string; teamId: number };

const generateNumId = () => Date.now() + Math.floor(Math.random() * 1000);
const PRESET_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#F97316",
  "#0EA5E9",
  "#EC4899",
];

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMode = (params.mode as any) || "headsup";

  const { decks, selectedDeckIds, loadDecks, toggleDeckSelection } =
    useDeckStore();
  const gameStore = useGameStore();

  const [scoringStyle, setScoringStyle] = useState<ScoringStyle>("rounds");
  const [targetLimit, setTargetLimit] = useState<number | "Infinity">(3);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("team");
  const [timerDuration, setTimerDuration] = useState(60);
  const [isDecksExpanded, setIsDecksExpanded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const [rosterData, setRosterData] = useState<ListItem[]>([
    { type: "team", id: 1, name: "Team 1", color: "#3B82F6" },
    { type: "player", id: 11, name: "Player 1", teamId: 1 },
    { type: "team", id: 2, name: "Team 2", color: "#EF4444" },
    { type: "player", id: 22, name: "Player 2", teamId: 2 },
  ]);

  useEffect(() => {
    loadDecks();
  }, []);

  const handleScoringStyleChange = (style: ScoringStyle) => {
    setScoringStyle(style);
    if (style === "rounds")
      setTargetLimit(
        targetLimit !== "Infinity" ? Math.min(20, Math.max(1, targetLimit)) : 3,
      );
    if (style === "boardgame")
      setTargetLimit(
        targetLimit !== "Infinity"
          ? Math.min(30, Math.max(5, targetLimit))
          : 30,
      );
  };

  const getUnusedColor = () => {
    const used = rosterData
      .filter((i) => i.type === "team")
      .map((t) => (t as any).color);
    const available = PRESET_COLORS.filter((c) => !used.includes(c));
    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : PRESET_COLORS[0];
  };

  const handleAddTeam = () => {
    const newId = generateNumId();
    setRosterData([
      ...rosterData,
      { type: "team", id: newId, name: "", color: getUnusedColor() },
    ]);
    setEditingId(newId);
    setEditName("");
  };

  const handleAddPlayer = (teamId?: number) => {
    const fallbackTeamId =
      rosterData.find((i) => i.type === "team")?.id || generateNumId();
    const newId = generateNumId();
    const newData = [...rosterData];

    const insertionIndex = teamId
      ? newData.findLastIndex((i) => i.type === "player" && i.teamId === teamId)
      : newData.length - 1;
    const actualIndex =
      insertionIndex > -1
        ? insertionIndex + 1
        : newData.findIndex((i) => i.id === teamId) + 1;

    newData.splice(teamId ? actualIndex : newData.length, 0, {
      type: "player",
      id: newId,
      name: "",
      teamId: teamId || fallbackTeamId,
    });
    setRosterData(newData);
    setEditingId(newId);
    setEditName("");
  };

  const handleDeleteEntity = (id: number, type: "player" | "team") => {
    if (type === "player") setRosterData(rosterData.filter((i) => i.id !== id));
    else
      setRosterData(
        rosterData.filter(
          (i) => i.id !== id && (i.type === "team" || i.teamId !== id),
        ),
      );
  };

  const handleSaveEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed.length > 30) {
      Alert.alert("Invalid Name", "Name must be between 1 and 30 characters.");
      return;
    }
    setRosterData(
      rosterData.map((item) =>
        item.id === editingId ? { ...item, name: trimmed } : item,
      ),
    );
    setEditingId(null);
  };

  const handleDragEnd = ({
    data,
    from,
  }: {
    data: ListItem[];
    from: number;
  }) => {
    const activeListItems =
      playStyle === "single"
        ? rosterData.filter((i) => i.type === "player")
        : rosterData;
    const movedItem = activeListItems[from];

    if (playStyle === "single") {
      const teams = rosterData.filter((i) => i.type === "team");
      setRosterData([...teams, ...data]);
      return;
    }

    if (movedItem?.type === "team") {
      // Re-stitch players directly beneath the newly positioned team header
      const teamPlayers = rosterData.filter(
        (i) => i.type === "player" && i.teamId === movedItem.id,
      );
      let newData = data.filter(
        (i) => !(i.type === "player" && i.teamId === movedItem.id),
      );

      const newHeaderIndex = newData.findIndex((i) => i.id === movedItem.id);
      newData.splice(newHeaderIndex + 1, 0, ...teamPlayers);

      setRosterData(newData);
    } else {
      // Re-assign a player to whatever visual team bracket they were dropped into
      let currentTeamId = data.find((i) => i.type === "team")?.id || 1;
      const newData = data.map((item) => {
        if (item.type === "team") {
          currentTeamId = item.id;
          return item;
        }
        return { ...item, teamId: currentTeamId };
      });
      setRosterData(newData);
    }
  };

  const handleStartGame = async () => {
    await useDeckStore.getState().loadCardsForSelectedDecks();
    const cards = useDeckStore.getState().currentCards;

    if (cards.length === 0) {
      Alert.alert(
        "No Decks",
        "Please select at least one deck containing cards.",
      );
      setIsDecksExpanded(true);
      return;
    }

    const finalTeams = rosterData.filter((i) => i.type === "team") as any;
    const finalPlayers = rosterData.filter(
      (i) => i.type === "player" && i.name.trim().length > 0,
    ) as any;

    if (
      playStyle === "team" &&
      (finalTeams.length < 1 || finalPlayers.length < 1)
    )
      return Alert.alert(
        "Invalid Roster",
        "Team mode requires at least 1 Team with 1 Player.",
      );
    if (playStyle === "single" && finalPlayers.length < 1)
      return Alert.alert(
        "Invalid Roster",
        "Solo mode requires at least 1 Player.",
      );

    gameStore.setupMatch({
      mode: selectedMode,
      scoringStyle,
      playStyle,
      targetLimit,
      timerDuration,
      matchTeams: finalTeams,
      matchPlayers: finalPlayers,
      cardsInRound: cards,
    });
    router.replace("/game/play");
  };

  const renderItemWrapper = (params: RenderItemParams<ListItem>) => {
    const itemTeamId =
      params.item.type === "player" ? params.item.teamId : null;
    const team = rosterData.find(
      (i) => i.type === "team" && i.id === itemTeamId,
    ) as any;
    const teamColor = playStyle === "team" && team ? team.color : "#1E293B";

    return (
      <RosterItem
        {...params}
        playStyle={playStyle}
        teamColor={teamColor}
        editingId={editingId}
        editName={editName}
        setEditName={setEditName}
        setEditingId={setEditingId}
        handleSaveEdit={handleSaveEdit}
        handleDeleteEntity={handleDeleteEntity}
      />
    );
  };

  const activeListItems =
    playStyle === "single"
      ? rosterData.filter((i) => i.type === "player")
      : rosterData;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <DraggableFlatList
          data={activeListItems}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItemWrapper}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          // ADD THESE PROPS:
          activationDistance={10} // Reduced from default 0 - helps with drag detection
          containerStyle={{ flex: 1 }}
          ListHeaderComponent={
            <MatchSetupHeader
              scoringStyle={scoringStyle}
              handleScoringStyleChange={handleScoringStyleChange}
              targetLimit={targetLimit}
              setTargetLimit={setTargetLimit}
              playStyle={playStyle}
              setPlayStyle={setPlayStyle}
            />
          }
          ListFooterComponent={
            <>
              <View className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-3xl p-5 pt-0 mb-4">
                {playStyle === "team" ? (
                  <View className="flex-row gap-2 mt-4">
                    <TouchableOpacity
                      onPress={handleAddTeam}
                      className="flex-1 border border-dashed border-slate-700 rounded-xl py-3 items-center"
                    >
                      <Text className="text-slate-400 font-bold text-xs">
                        + Add Team
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAddPlayer()}
                      className="flex-1 border border-dashed border-slate-700 rounded-xl py-3 items-center"
                    >
                      <Text className="text-slate-400 font-bold text-xs">
                        + Add Player
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleAddPlayer()}
                    className="border border-dashed border-slate-700 rounded-xl py-3 items-center mt-4"
                  >
                    <Text className="text-slate-400 font-bold">
                      + Add Solo Player
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

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

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/90 border-t border-slate-900">
        <TouchableOpacity
          onPress={handleStartGame}
          className="bg-emerald-600 rounded-2xl p-4 items-center shadow-lg"
        >
          <Text className="text-white font-black text-xl tracking-wide uppercase">
            Start Game
          </Text>
          <Text className="text-emerald-200 text-xs mt-1 font-medium">
            {playStyle === "team"
              ? `${rosterData.filter((i) => i.type === "team").length} Teams`
              : `${rosterData.filter((i) => i.type === "player" && i.name.trim().length > 0).length} Players`}{" "}
            •{" "}
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
