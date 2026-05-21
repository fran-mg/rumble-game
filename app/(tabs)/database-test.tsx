import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../stores/useDeckStore";
import { useTeamStore } from "../../stores/useTeamStore";
import { dbHelpers, initDatabase } from "../../utils/database";

export default function DatabaseTestScreen() {
  const { teams, loadTeams, createTeam, deleteTeam } = useTeamStore();
  const { decks, loadDecks, createDeck, deleteDeck } = useDeckStore();
  const [dbStatus, setDbStatus] = useState<
    "initializing" | "connected" | "error"
  >("initializing");

  useEffect(() => {
    runInit();
  }, []);

  const runInit = async () => {
    try {
      await initDatabase();
      setDbStatus("connected");
      await Promise.all([loadTeams(), loadDecks()]);
    } catch (e) {
      setDbStatus("error");
      console.error(e);
    }
  };

  const handleAddSampleData = async () => {
    try {
      // Add a clean test team without tacky emojis
      const teamNames = ["Alpha Squad", "Beta Brains", "Delta Force"];
      const randomName =
        teamNames[Math.floor(Math.random() * teamNames.length)] +
        " " +
        Math.floor(Math.random() * 100);
      await createTeam(randomName, "#10B981", "Target");

      // Add a clean sample deck
      const deckId = await dbHelpers.createDeck(
        `Pop Culture Vol. ${decks.length + 1}`,
        "Media",
        "bundled",
        "Tv",
      );
      if (deckId) {
        await dbHelpers.createCard(
          deckId,
          "Batman",
          ["Robin", "Gotham", "Joker", "Caped"],
          "easy",
        );
        await dbHelpers.createCard(
          deckId,
          "Inception",
          ["Dream", "Leonardo", "Spinning", "Top"],
          "hard",
        );
      }

      await Promise.all([loadTeams(), loadDecks()]);
      Alert.alert("Success", "Seeded clean sample entities securely!");
    } catch (err) {
      Alert.alert("Error", "Failed to add test records.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-4 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Block */}
        <View className="mb-6 flex-row items-center justify-between border-b border-slate-800 pb-4">
          <View>
            <Text className="text-2xl font-black text-white tracking-tight">
              Core Engine
            </Text>
            <Text className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              Hardware Diagnostics
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${dbStatus === "connected" ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
          >
            <View
              className={`w-2 h-2 rounded-full ${dbStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            />
            <Text
              className={`text-xs font-bold ${dbStatus === "connected" ? "text-emerald-400" : "text-amber-400"}`}
            >
              {dbStatus === "connected" ? "SQLITE ACTIVE" : "CONNECTING"}
            </Text>
          </View>
        </View>

        {/* Metrics Overview Container */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Loaded Decks
            </Text>
            <Text className="text-3xl font-black text-white mt-1">
              {decks.length}
            </Text>
          </View>
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Active Teams
            </Text>
            <Text className="text-3xl font-black text-white mt-1">
              {teams.length}
            </Text>
          </View>
        </View>

        {/* Diagnostic Actions */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddSampleData}
          className="bg-blue-600 rounded-2xl py-4 items-center justify-center mb-8 flex-row gap-2 shadow-lg shadow-blue-500/20"
        >
          <LucideIcons.PlusCircle color="white" size={20} />
          <Text className="text-white font-extrabold text-base tracking-tight">
            Inject Sample Deck & Team
          </Text>
        </TouchableOpacity>

        {/* Live Records Sections */}
        <View className="mb-6">
          <Text className="text-white text-lg font-black mb-3 px-1">
            Decks Cache
          </Text>
          {decks.length === 0 ? (
            <Text className="text-slate-500 italic text-sm px-1">
              No decks available. Inject sample files above.
            </Text>
          ) : (
            decks.map((deck) => (
              <View
                key={deck.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2.5 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-slate-800 p-2 rounded-lg">
                    <LucideIcons.Layers color="#94A3B8" size={18} />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">
                      {deck.name}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {deck.category} • {deck.card_count} cards
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteDeck(deck.id)}
                  hitSlop={12}
                >
                  <LucideIcons.Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View className="mb-12">
          <Text className="text-white text-lg font-black mb-3 px-1">
            Registered Teams
          </Text>
          {teams.length === 0 ? (
            <Text className="text-slate-500 italic text-sm px-1">
              No active teams compiled yet.
            </Text>
          ) : (
            teams.map((team) => (
              <View
                key={team.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2.5 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <Text className="text-white font-bold text-sm">
                    {team.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTeam(team.id)}
                  hitSlop={12}
                >
                  <LucideIcons.Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
