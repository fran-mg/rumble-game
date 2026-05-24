import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../stores/useDeckStore";
import {
  PlayStyle,
  ScoringStyle,
  useGameStore,
} from "../../stores/useGameStore";

// Unique ID generator for transient players
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMode = (params.mode as any) || "headsup";

  const { decks, selectedDeckIds, loadDecks, toggleDeckSelection } =
    useDeckStore();
  const gameStore = useGameStore();

  // Local State for Settings before Saving
  const [scoringStyle, setScoringStyle] = useState<ScoringStyle>("rounds");
  const [targetLimit, setTargetLimit] = useState<number | "Infinity">(3);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("team");
  const [timerDuration, setTimerDuration] = useState(60);
  const [isDecksExpanded, setIsDecksExpanded] = useState(false);

  // Roster Local State
  const [teams, setTeams] = useState([
    { id: "t1", name: "Team 1", color: "#3B82F6" },
    { id: "t2", name: "Team 2", color: "#EF4444" },
  ]);
  const [players, setPlayers] = useState<
    Array<{ id: string; name: string; teamId: string }>
  >([
    { id: "p1", name: "Player 1", teamId: "t1" },
    { id: "p2", name: "Player 2", teamId: "t2" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadDecks();
  }, []);

  const handleAddPlayer = (teamId?: string) => {
    setPlayers([
      ...players,
      {
        id: generateId(),
        name: `Player ${players.length + 1}`,
        teamId: teamId || 1,
      },
    ]);
  };

  const handleDeleteEntity = (id: string, type: "player" | "team") => {
    if (type === "player") setPlayers(players.filter((p) => p.id !== id));
    if (type === "team") {
      setTeams(teams.filter((t) => t.id !== id));
      setPlayers(players.filter((p) => p.teamId !== id)); // Remove players in team
    }
  };

  const handleSaveEdit = () => {
    if (teams.find((t) => t.id === editingId)) {
      setTeams(
        teams.map((t) => (t.id === editingId ? { ...t, name: editName } : t)),
      );
    } else {
      setPlayers(
        players.map((p) => (p.id === editingId ? { ...p, name: editName } : p)),
      );
    }
    setEditingId(null);
  };

  const handleStartGame = async () => {
    // Ensure cards are loaded based on selected decks
    await useDeckStore.getState().loadCardsForSelectedDecks();
    const cards = useDeckStore.getState().currentCards;

    if (cards.length === 0) {
      alert("Please select at least one deck containing cards!");
      setIsDecksExpanded(true);
      return;
    }

    gameStore.setupMatch({
      mode: selectedMode,
      scoringStyle,
      playStyle,
      targetLimit,
      timerDuration,
      matchTeams: teams,
      matchPlayers: players,
      cardsInRound: cards,
    });

    router.replace("/game/play");
  };

  const activeDecksCount = decks.filter((d) =>
    selectedDeckIds.includes(d.id),
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-3xl font-black text-white tracking-tight mb-6">
            Match Setup
          </Text>

          {/* 1. SCORING STYLE CARD */}
          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">
              Scoring Style
            </Text>
            <View className="flex-row bg-slate-950 rounded-xl p-1 mb-4">
              <TouchableOpacity
                onPress={() => setScoringStyle("rounds")}
                className={`flex-1 py-2 rounded-lg items-center ${scoringStyle === "rounds" ? "bg-blue-600" : ""}`}
              >
                <Text
                  className={`font-bold ${scoringStyle === "rounds" ? "text-white" : "text-slate-500"}`}
                >
                  Rounds
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setScoringStyle("boardgame")}
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
                <Text className="text-white font-medium">Target Rounds:</Text>
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
                      onChangeText={(val) => setTargetLimit(parseInt(val) || 1)}
                      keyboardType="number-pad"
                      className="bg-slate-950 text-white font-bold px-4 py-2 rounded-xl text-center w-16"
                    />
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-medium">Tiles to Finish:</Text>
                <TextInput
                  value={String(targetLimit === "Infinity" ? 30 : targetLimit)}
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

          {/* 2. PLAYER ROSTER CARD (Simplified List for MVP Stability) */}
          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Player Select
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setPlayStyle("single")}
                  className={`px-3 py-1 rounded-lg ${playStyle === "single" ? "bg-blue-600" : "bg-slate-800"}`}
                >
                  <Text className="text-white text-xs font-bold">Solos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPlayStyle("team")}
                  className={`px-3 py-1 rounded-lg ${playStyle === "team" ? "bg-blue-600" : "bg-slate-800"}`}
                >
                  <Text className="text-white text-xs font-bold">Teams</Text>
                </TouchableOpacity>
              </View>
            </View>

            {playStyle === "team" ? (
              <View>
                {teams.map((team) => (
                  <View
                    key={team.id}
                    style={{ borderColor: team.color }}
                    className="border-2 rounded-2xl p-3 mb-3"
                  >
                    {/* Team Header */}
                    <View className="flex-row justify-between items-center mb-2 border-b border-slate-800 pb-2">
                      <Text className="text-white font-black text-lg">
                        {team.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteEntity(team.id, "team")}
                      >
                        <LucideIcons.Trash2 color="#EF4444" size={16} />
                      </TouchableOpacity>
                    </View>
                    {/* Players in Team */}
                    {players
                      .filter((p) => p.teamId === team.id)
                      .map((player) => (
                        <View
                          key={player.id}
                          className="flex-row items-center justify-between bg-slate-950 p-2 rounded-xl mb-1 ml-4"
                        >
                          {editingId === player.id ? (
                            <TextInput
                              value={editName}
                              onChangeText={setEditName}
                              autoFocus
                              className="flex-1 text-white font-bold"
                            />
                          ) : (
                            <Text className="text-slate-300 font-medium flex-1">
                              {player.name}
                            </Text>
                          )}
                          <View className="flex-row gap-3 ml-2">
                            {editingId === player.id ? (
                              <>
                                <TouchableOpacity onPress={handleSaveEdit}>
                                  <LucideIcons.Check
                                    color="#10B981"
                                    size={18}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => setEditingId(null)}
                                >
                                  <LucideIcons.X color="#EF4444" size={18} />
                                </TouchableOpacity>
                              </>
                            ) : (
                              <>
                                <TouchableOpacity
                                  onPress={() => {
                                    setEditingId(player.id);
                                    setEditName(player.name);
                                  }}
                                >
                                  <LucideIcons.Edit3
                                    color="#64748B"
                                    size={16}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleDeleteEntity(player.id, "player")
                                  }
                                >
                                  <LucideIcons.Trash2
                                    color="#EF4444"
                                    size={16}
                                  />
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    <TouchableOpacity
                      onPress={() => handleAddPlayer(team.id)}
                      className="mt-2 flex-row items-center ml-4"
                    >
                      <LucideIcons.Plus color="#3B82F6" size={14} />
                      <Text className="text-blue-500 font-bold text-xs ml-1">
                        Add Player
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() =>
                    setTeams([
                      ...teams,
                      {
                        id: generateId(),
                        name: `Team ${teams.length + 1}`,
                        color: "#8B5CF6",
                      },
                    ])
                  }
                  className="border border-dashed border-slate-700 rounded-xl py-3 items-center"
                >
                  <Text className="text-slate-400 font-bold">+ Add Team</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Single Player List */}
                {players.map((player) => (
                  <View
                    key={player.id}
                    className="flex-row items-center justify-between bg-slate-950 p-3 rounded-xl mb-2"
                  >
                    {editingId === player.id ? (
                      <TextInput
                        value={editName}
                        onChangeText={setEditName}
                        autoFocus
                        className="flex-1 text-white font-bold"
                      />
                    ) : (
                      <Text className="text-slate-300 font-medium flex-1">
                        {player.name}
                      </Text>
                    )}
                    <View className="flex-row gap-3 ml-2">
                      {editingId === player.id ? (
                        <>
                          <TouchableOpacity onPress={handleSaveEdit}>
                            <LucideIcons.Check color="#10B981" size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditingId(null)}>
                            <LucideIcons.X color="#EF4444" size={18} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(player.id);
                              setEditName(player.name);
                            }}
                          >
                            <LucideIcons.Edit3 color="#64748B" size={16} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteEntity(player.id, "player")
                            }
                          >
                            <LucideIcons.Trash2 color="#EF4444" size={16} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => handleAddPlayer()}
                  className="border border-dashed border-slate-700 rounded-xl py-3 items-center mt-2"
                >
                  <Text className="text-slate-400 font-bold">+ Add Player</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 3. DECKS CARD */}
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
                  {activeDecksCount} Active Decks
                </Text>
              </View>
              <LucideIcons.ChevronDown
                color="#64748B"
                size={20}
                style={{
                  transform: [{ rotate: isDecksExpanded ? "180deg" : "0deg" }],
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
                      className={`px-3 py-2 rounded-xl border flex-row items-center gap-2 ${isSelected ? "bg-blue-600/20 border-blue-500" : "bg-slate-950 border-slate-800 opacity-60"}`}
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

          {/* 4. TURN TIMER CARD */}
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

          {/* 5. STICKY FOOTER */}

          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-12">
            <TouchableOpacity
              onPress={handleStartGame}
              className="bg-emerald-600 rounded-2xl p-4 items-center shadow-lg shadow-emerald-900/50"
            >
              <Text className="text-white font-black text-xl tracking-wide uppercase">
                Start Game
              </Text>
              <Text className="text-emerald-200 text-xs mt-1 font-medium">
                {playStyle === "team"
                  ? `${teams.length} Teams`
                  : `${players.length} Players`}{" "}
                •{" "}
                {scoringStyle === "rounds"
                  ? `${targetLimit} Rounds`
                  : `${targetLimit} Tiles`}{" "}
                • {timerDuration}s Turns
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
