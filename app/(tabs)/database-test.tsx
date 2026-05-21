import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dbHelpers } from "../../utils/database";

export default function DatabaseTestScreen() {
  const [decks, setDecks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [settings, setSettings] = useState<string>("");

  useEffect(() => {
    if (Platform.OS !== "web") {
      loadData();
    }
  }, []);

  const loadData = async () => {
    const allDecks = await dbHelpers.getAllDecks();
    const allTeams = await dbHelpers.getAllTeams();
    const timerSetting = await dbHelpers.getSetting("timer_duration");

    setDecks(allDecks);
    setTeams(allTeams);
    setSettings(timerSetting || "not set");
  };

  const createTestDeck = async () => {
    const deckId = await dbHelpers.createDeck(
      "Test Animals",
      "Nature",
      "user-created",
    );
    if (deckId) {
      await dbHelpers.createCard(deckId, "Elephant", [
        "trunk",
        "grey",
        "big",
        "Africa",
        "mammal",
      ]);
      await dbHelpers.createCard(deckId, "Penguin", [
        "bird",
        "Antarctica",
        "waddle",
        "fish",
        "tuxedo",
      ]);
    }
    await loadData();
  };

  const createTestTeam = async () => {
    await dbHelpers.createTeam("Test Team", "#FF0000", "");
    await loadData();
  };

  if (Platform.OS === "web") {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-6">
        <Text className="text-2xl font-bold text-gray-700">
          Database Not Available on Web
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          This app requires native SQLite. Please test on iOS or Android via
          Expo Go.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6">Database Test</Text>

        {/* Decks Section */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-xl font-bold mb-2">Decks ({decks.length})</Text>
          {decks.map((deck) => (
            <View key={deck.id} className="bg-gray-100 p-3 rounded mb-2">
              <Text className="font-bold">{deck.name}</Text>
              <Text className="text-sm text-gray-600">
                Category: {deck.category} | Source: {deck.source} | Cards:{" "}
                {deck.card_count}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={createTestDeck}
            className="bg-blue-500 p-3 rounded mt-2 active:bg-blue-600"
          >
            <Text className="text-white text-center font-bold">
              Create Test Deck
            </Text>
          </TouchableOpacity>
        </View>

        {/* Teams Section */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-xl font-bold mb-2">Teams ({teams.length})</Text>
          {teams.map((team) => (
            <View key={team.id} className="bg-gray-100 p-3 rounded mb-2">
              <Text className="font-bold">{team.name}</Text>
              <View
                className="w-8 h-8 rounded mt-1"
                style={{ backgroundColor: team.color }}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={createTestTeam}
            className="bg-green-500 p-3 rounded mt-2 active:bg-green-600"
          >
            <Text className="text-white text-center font-bold">
              Create Test Team
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View className="bg-white rounded-lg p-4 shadow">
          <Text className="text-xl font-bold mb-2">Settings</Text>
          <Text>Timer Duration: {settings}s</Text>
        </View>
      </View>
    </ScrollView>
  );
}
