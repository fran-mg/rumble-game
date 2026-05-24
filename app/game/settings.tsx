import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../stores/useDeckStore";
import {
  PlayStyle,
  ScoringStyle,
  useGameStore,
} from "../../stores/useGameStore";

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

type ListItem =
  | { type: "team"; id: number; name: string; color: string }
  | { type: "player"; id: number; name: string; teamId: number };

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

  const [rosterData, setRosterData] = useState<ListItem[]>([
    { type: "team", id: 1, name: "Team 1", color: "#3B82F6" },
    { type: "player", id: 11, name: "Player 1", teamId: 1 },
    { type: "team", id: 2, name: "Team 2", color: "#EF4444" },
    { type: "player", id: 22, name: "Player 2", teamId: 2 },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadDecks();
  }, []);

  const handleScoringStyleChange = (style: ScoringStyle) => {
    setScoringStyle(style);
    if (style === "rounds") {
      if (targetLimit !== "Infinity" && targetLimit > 20) setTargetLimit(20);
      if (targetLimit !== "Infinity" && targetLimit < 1) setTargetLimit(1);
    }
    if (style === "boardgame") {
      if (targetLimit === "Infinity") setTargetLimit(30);
      if (targetLimit !== "Infinity" && targetLimit > 30) setTargetLimit(30);
      if (targetLimit !== "Infinity" && targetLimit < 5) setTargetLimit(5);
    }
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
    if (type === "player") {
      setRosterData(rosterData.filter((i) => i.id !== id));
    } else {
      setRosterData(
        rosterData.filter(
          (i) => i.id !== id && (i.type === "team" || i.teamId !== id),
        ),
      );
    }
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

  const handleDragEnd = ({ data }: { data: ListItem[] }) => {
    let currentTeamId = data.find((i) => i.type === "team")?.id || 1;
    const resolvedData = data.map((item) => {
      if (item.type === "team") {
        currentTeamId = item.id;
        return item;
      }
      return { ...item, teamId: currentTeamId };
    });
    setRosterData(resolvedData);
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
      (i) => i.type === "player" && i.name,
    ) as any;

    if (
      playStyle === "team" &&
      (finalTeams.length < 1 || finalPlayers.length < 1)
    ) {
      Alert.alert(
        "Invalid Roster",
        "Team mode requires at least 1 Team with 1 Player.",
      );
      return;
    }
    if (playStyle === "single" && finalPlayers.length < 1) {
      Alert.alert("Invalid Roster", "Solo mode requires at least 1 Player.");
      return;
    }

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

  const renderRosterItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ListItem>) => {
    if (playStyle === "single" && item.type === "team") return null;

    if (item.type === "team") {
      return (
        <ScaleDecorator>
          <View
            style={{
              borderColor: item.color,
              backgroundColor: isActive ? "#0F172A" : "transparent",
            }}
            className={`border-x-2 border-t-2 rounded-t-2xl p-3 shadow-lg mt-3 ${isActive ? "border-b-2 rounded-b-2xl border-blue-500 z-50" : ""}`}
          >
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onLongPress={drag} className="p-2 -ml-2">
                <LucideIcons.GripVertical color="#64748B" size={20} />
              </TouchableOpacity>

              {editingId === item.id ? (
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  maxLength={30}
                  className="flex-1 text-white font-black text-lg mx-2"
                />
              ) : (
                <Text className="flex-1 text-white font-black text-lg mx-2">
                  {item.name}
                </Text>
              )}

              <View className="flex-row gap-3">
                {editingId === item.id ? (
                  <>
                    <TouchableOpacity onPress={handleSaveEdit}>
                      <LucideIcons.Check color="#10B981" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(null);
                        if (!item.name) handleDeleteEntity(item.id, "team");
                      }}
                    >
                      <LucideIcons.X color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                    >
                      <LucideIcons.Edit3 color="#64748B" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntity(item.id, "team")}
                    >
                      <LucideIcons.Trash2 color="#EF4444" size={18} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </ScaleDecorator>
      );
    }

    const team = rosterData.find(
      (i) => i.type === "team" && i.id === item.teamId,
    ) as any;
    const teamColor = playStyle === "team" && team ? team.color : "#1E293B";

    return (
      <ScaleDecorator>
        <View
          style={{ borderColor: teamColor }}
          className={`flex-row items-center bg-slate-950/80 p-3 border-x-2 border-b-2 ${playStyle === "single" ? "rounded-xl border-t-2 mb-2 border-slate-800" : ""} ${isActive ? "opacity-80 scale-105 shadow-xl border-blue-500 rounded-xl border-t-2 z-50" : ""}`}
        >
          <TouchableOpacity onLongPress={drag} className="p-2 -ml-2">
            <LucideIcons.GripVertical color="#64748B" size={18} />
          </TouchableOpacity>

          {editingId === item.id ? (
            <TextInput
              value={editName}
              onChangeText={setEditName}
              autoFocus
              maxLength={30}
              className="flex-1 text-white font-medium mx-2"
            />
          ) : (
            <Text className="flex-1 text-slate-300 font-medium mx-2">
              {item.name}
            </Text>
          )}

          <View className="flex-row gap-3">
            {editingId === item.id ? (
              <>
                <TouchableOpacity onPress={handleSaveEdit}>
                  <LucideIcons.Check color="#10B981" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(null);
                    if (!item.name) handleDeleteEntity(item.id, "player");
                  }}
                >
                  <LucideIcons.X color="#EF4444" size={18} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                  }}
                >
                  <LucideIcons.Edit3 color="#64748B" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteEntity(item.id, "player")}
                >
                  <LucideIcons.Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <DraggableFlatList
          data={rosterData}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRosterItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Text className="text-3xl font-black text-white tracking-tight mb-6">
                Match Setup
              </Text>

              <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
                <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">
                  Scoring Style
                </Text>
                <View className="flex-row bg-slate-950 rounded-xl p-1 mb-4">
                  <TouchableOpacity
                    onPress={() => handleScoringStyleChange("rounds")}
                    className={`flex-1 py-2 rounded-lg items-center ${scoringStyle === "rounds" ? "bg-blue-600" : ""}`}
                  >
                    <Text
                      className={`font-bold ${scoringStyle === "rounds" ? "text-white" : "text-slate-500"}`}
                    >
                      Rounds
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleScoringStyleChange("boardgame")}
                    className={`flex-1 py-2 rounded-lg items-center ${scoringStyle === "boardgame" ? "bg-blue-600" : ""}`}
                  >
                    <Text
                      className={`font-bold ${scoringStyle === "boardgame" ? "text-white" : "text-slate-500"}`}
                    >
                      Boardgame
                    </Text>
                  </TouchableOpacity>
                </View>

                {scoringStyle === "rounds" ? (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-medium">
                      Target Rounds (1-20):
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() =>
                          setTargetLimit(
                            targetLimit === "Infinity" ? 3 : "Infinity",
                          )
                        }
                        className={`px-3 py-1 rounded-full border ${targetLimit === "Infinity" ? "border-blue-500 bg-blue-500/20" : "border-slate-700"}`}
                      >
                        <Text className="text-white font-bold">∞</Text>
                      </TouchableOpacity>
                      {targetLimit !== "Infinity" && (
                        <TextInput
                          value={String(targetLimit)}
                          onChangeText={(val) =>
                            setTargetLimit(
                              Math.min(20, Math.max(1, parseInt(val) || 1)),
                            )
                          }
                          keyboardType="number-pad"
                          className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16"
                        />
                      )}
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-medium">
                      Tiles to Finish (5-30):
                    </Text>
                    <TextInput
                      value={String(
                        targetLimit === "Infinity" ? 30 : targetLimit,
                      )}
                      onChangeText={(val) =>
                        setTargetLimit(
                          Math.min(30, Math.max(5, parseInt(val) || 5)),
                        )
                      }
                      keyboardType="number-pad"
                      className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16"
                    />
                  </View>
                )}
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-t-3xl p-5 pb-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Player Select
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setPlayStyle("single")}
                      className={`px-3 py-1 rounded-lg ${playStyle === "single" ? "bg-blue-600" : "bg-slate-800"}`}
                    >
                      <Text className="text-white text-xs font-bold">
                        Solos
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setPlayStyle("team")}
                      className={`px-3 py-1 rounded-lg ${playStyle === "team" ? "bg-blue-600" : "bg-slate-800"}`}
                    >
                      <Text className="text-white text-xs font-bold">
                        Teams
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
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

              <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
                <TouchableOpacity
                  onPress={() => setIsDecksExpanded(!isDecksExpanded)}
                  className="flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">
                      Decks in Play
                    </Text>
                    <Text className="text-white font-bold">
                      {selectedDeckIds.length} Active Decks
                    </Text>
                  </View>
                  <LucideIcons.ChevronDown
                    color="#64748B"
                    size={20}
                    style={{
                      transform: [
                        { rotate: isDecksExpanded ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </TouchableOpacity>

                {isDecksExpanded && (
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    {decks.map((deck) => {
                      const isSelected = selectedDeckIds.includes(deck.id);
                      return (
                        <TouchableOpacity
                          key={deck.id}
                          onPress={() => toggleDeckSelection(deck.id)}
                          className={`px-3 py-2 rounded-xl border flex-row items-center gap-2 ${isSelected ? "bg-blue-600/30 border-blue-500 shadow-lg" : "bg-slate-950 border-slate-800 opacity-50"}`}
                        >
                          {isSelected && (
                            <LucideIcons.Check color="#3B82F6" size={14} />
                          )}
                          <Text
                            className={
                              isSelected
                                ? "text-white font-bold"
                                : "text-slate-400 font-medium"
                            }
                          >
                            {deck.name}{" "}
                            <Text className="text-xs opacity-50">
                              ({deck.card_count})
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
                <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">
                  Turn Timer
                </Text>
                <View className="items-center mb-2">
                  <Text
                    className={`text-4xl font-black ${timerDuration <= 20 ? "text-red-500" : "text-indigo-400"}`}
                  >
                    {timerDuration}s
                  </Text>
                </View>
                {/* To prevent FlatList intercepting Slider, wrap in gesture capture */}
                <View
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                >
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={10}
                    maximumValue={180}
                    step={5}
                    value={timerDuration}
                    onValueChange={setTimerDuration}
                    minimumTrackTintColor={
                      timerDuration <= 20 ? "#EF4444" : "#6366F1"
                    }
                    maximumTrackTintColor="#1E293B"
                    thumbTintColor="#FFFFFF"
                  />
                </View>
              </View>
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
              : `${rosterData.filter((i) => i.type === "player").length} Players`}{" "}
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
