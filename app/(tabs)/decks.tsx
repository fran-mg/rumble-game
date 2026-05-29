import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";
import { useDeckStore } from "../../stores/useDeckStore";
import { generateDeckViaAI } from "../../utils/aiGenerator";
import db from "../../utils/database";
import { seedStarterDecksIfEmpty } from "../../utils/deckImporter";
import { injectExtendedSampleDecks } from "../../utils/sampleDeckInjector";

export default function DecksScreen() {
  const theme = useAppTheme();
  const { decks, loadDecks, deleteDeck } = useDeckStore();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  const [editingDeck, setEditingDeck] = useState<any | null>(null);
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [newWord, setNewWord] = useState<string>("");

  useEffect(() => {
    initDeckFlow();
  }, []);

  const initDeckFlow = async () => {
    await seedStarterDecksIfEmpty();
    await loadDecks();
  };

  const handleAddSampleData = async () => {
    setIsInjecting(true);
    try {
      await injectExtendedSampleDecks(decks.length, loadDecks);
    } catch (err) {
      Alert.alert("Error", "Failed to populate test decks.");
      console.error(err);
    } finally {
      setIsInjecting(false);
    }
  };

  const triggerAIGeneration = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    const result = await generateDeckViaAI(
      aiPrompt,
      process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
    );
    setIsGenerating(false);

    if (result.success) {
      setAiPrompt("");
      await loadDecks();
      Alert.alert(
        "Pack Realized",
        "Your custom card pack has been successfully integrated into local memory arrays.",
      );
    } else {
      Alert.alert("Generation Halt", result.error || "Review network logs.");
    }
  };

  const openDeckEditor = async (deck: any) => {
    if (!db) return;
    try {
      const cards = await db.getAllAsync(
        "SELECT * FROM cards WHERE deck_id = ?;",
        [deck.id],
      );
      setDeckCards(cards);
      setEditingDeck(deck);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomCard = async () => {
    if (!newWord.trim() || !editingDeck || !db) return;
    try {
      await db.runAsync(
        "INSERT INTO cards (deck_id, word, taboo_words, difficulty) VALUES (?, ?, ?, ?);",
        [editingDeck.id, newWord, JSON.stringify(["custom", "hint"]), "medium"],
      );

      await db.runAsync(
        "UPDATE decks SET card_count = card_count + 1 WHERE id = ?;",
        [editingDeck.id],
      );

      setNewWord("");
      const cards = await db.getAllAsync(
        "SELECT * FROM cards WHERE deck_id = ?;",
        [editingDeck.id],
      );
      setDeckCards(cards);
      await loadDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!db || !editingDeck) return;
    try {
      await db.runAsync("DELETE FROM cards WHERE id = ?;", [cardId]);
      await db.runAsync(
        "UPDATE decks SET card_count = MAX(0, card_count - 1) WHERE id = ?;",
        [editingDeck.id],
      );
      const cards = await db.getAllAsync(
        "SELECT * FROM cards WHERE deck_id = ?;",
        [editingDeck.id],
      );
      setDeckCards(cards);
      await loadDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(decks.map((d) => d.category.toLowerCase()))),
  ];
  const filteredDecks =
    activeTab === "all"
      ? decks
      : decks.filter((d) => d.category.toLowerCase() === activeTab);

  return (
    <SafeAreaView className={`flex-1 ${theme.background} p-4`}>
      {/* AI Forge Control Box */}
      <View className={`${theme.surface} border p-4 rounded-2xl mb-3`}>
        <Text
          className={`${theme.textPrimary} font-black text-sm uppercase tracking-wider mb-2`}
        >
          AI Deck Forge (Groq Network)
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            placeholder="Theme prompt (e.g., Star Wars Planets)"
            placeholderTextColor={theme.isDark ? "#64748B" : "#94A3B8"}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            className={`flex-1 ${theme.inputBg} border rounded-xl px-4 ${theme.textPrimary} font-medium`}
          />
          <TouchableOpacity
            onPress={triggerAIGeneration}
            disabled={isGenerating}
            className="bg-indigo-600 px-4 rounded-xl items-center justify-center flex-row"
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <LucideIcons.Sparkles color="white" size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Local Seeding Control Box */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleAddSampleData}
        disabled={isInjecting}
        className="bg-blue-600 rounded-2xl py-3.5 items-center justify-center mb-6 flex-row gap-2 shadow-lg shadow-blue-500/20"
      >
        {isInjecting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <LucideIcons.PlusCircle color="white" size={18} />
            <Text className="text-white font-extrabold text-sm tracking-tight uppercase">
              Inject Extended Sample Decks
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Category Navigation Bar */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-full border ${activeTab === cat ? "bg-blue-600 border-blue-500" : theme.surface}`}
            >
              <Text
                className={`${activeTab === cat ? "text-white" : theme.textSecondary} text-xs font-bold capitalize`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Responsive Selection Grid */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text
          className={`${theme.textSecondary} text-xs font-black uppercase tracking-widest mb-3 px-1`}
        >
          Available Track Packs
        </Text>
        {filteredDecks.map((deck) => {
          return (
            <View
              key={deck.id}
              className={`border p-4 rounded-2xl mb-3 flex-row justify-between items-center ${theme.surface}`}
            >
              <View className="flex-1 flex-row items-center gap-4">
                <View className={`p-3 rounded-xl ${theme.inputBg}`}>
                  <LucideIcons.Layers color={theme.iconColor} size={20} />
                </View>
                <View className="flex-1">
                  <Text className={`${theme.textPrimary} font-black text-base`}>
                    {deck.name}
                  </Text>
                  <Text
                    className={`${theme.textSecondary} text-xs font-medium mt-0.5`}
                  >
                    {deck.category} • {deck.card_count} objects
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 pl-2">
                <TouchableOpacity
                  onPress={() => openDeckEditor(deck)}
                  className={`p-2 ${theme.inputBg} rounded-lg`}
                >
                  <LucideIcons.Edit3 color={theme.iconColor} size={16} />
                </TouchableOpacity>
                {/* Notice the click logic simplifies drastically to just execute deletion */}
                <TouchableOpacity
                  onPress={() => deleteDeck(deck.id)}
                  className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <LucideIcons.Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {/* Roster Expansion Matrix Drawer Overlay */}
      <Modal visible={editingDeck !== null} animationType="slide" transparent>
        <SafeAreaView className="flex-1 bg-black/40 p-4 justify-end">
          <View
            className={`${theme.surface} border rounded-3xl p-5 h-[80%] shadow-2xl`}
          >
            <View className="flex-row justify-between items-center border-b border-slate-800/10 pb-3 mb-4">
              <Text className={`${theme.textPrimary} font-black text-lg`}>
                {editingDeck?.name}
              </Text>
              <TouchableOpacity onPress={() => setEditingDeck(null)}>
                <LucideIcons.X color={theme.iconColor} size={24} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-4">
              <TextInput
                placeholder="Append custom target label string"
                placeholderTextColor={theme.isDark ? "#64748B" : "#94A3B8"}
                value={newWord}
                onChangeText={setNewWord}
                className={`flex-1 ${theme.inputBg} border rounded-xl px-4 ${theme.textPrimary} font-medium`}
              />
              <TouchableOpacity
                onPress={handleAddCustomCard}
                className="bg-emerald-600 px-4 rounded-xl justify-center"
              >
                <LucideIcons.Plus color="white" size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {deckCards.map((card) => (
                <View
                  key={card.id}
                  className={`${theme.inputBg} border p-3 rounded-xl mb-2 flex-row justify-between items-center`}
                >
                  <Text className={`${theme.textPrimary} font-bold`}>
                    {card.word}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                    <LucideIcons.XCircle color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
