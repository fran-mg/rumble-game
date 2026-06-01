import * as React from "react";
import { useState, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../stores/useDeckStore";
import { generateDeckViaAI } from "../../utils/aiGenerator";
import { seedStarterDecksIfEmpty } from "../../utils/deckImporter";
import { Deck } from "../../stores/useDeckStore";

import AIForgeCard from "./_AIForgeCard";
import CategoryFilter from "./_CategoryFilter";
import DeckList from "./_DeckList";
import PageHeader from "./_PageHeader";
import CloudDecksModal from "./_DownloadDecks";
import EditDeckModal from "./_EditDeck";
import { styles } from "./Decks.styles";

export default function DecksScreen() {
  const { decks, loadDecks, deleteDeck } = useDeckStore();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isCloudModalVisible, setIsCloudModalVisible] = useState(false);

  useEffect(() => {
    initDeckFlow();
  }, []);

  const initDeckFlow = async () => {
    await seedStarterDecksIfEmpty();
    await loadDecks();
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    const result = await generateDeckViaAI(
      aiPrompt,
      process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "",
    );
    setIsGenerating(false);

    if (result.success) {
      setAiPrompt("");
      await loadDecks();
      Alert.alert("Pack Created", "Your custom card pack has been added.");
    } else {
      Alert.alert("Generation Failed", result.error ?? "Review network logs.");
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
    <SafeAreaView style={styles.root}>
      <PageHeader onCloudPress={() => setIsCloudModalVisible(true)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {false && (
          <AIForgeCard
            prompt={aiPrompt}
            isGenerating={isGenerating}
            onChangePrompt={setAiPrompt}
            onGenerate={handleAIGenerate}
          />
        )}

        <CategoryFilter
          categories={categories}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />

        <DeckList
          decks={filteredDecks}
          onEdit={setEditingDeck}
          onDelete={deleteDeck}
        />
      </ScrollView>

      <CloudDecksModal
        visible={isCloudModalVisible}
        onClose={() => setIsCloudModalVisible(false)}
        onDecksUpdated={loadDecks}
        installedDecks={decks}
      />
      <EditDeckModal
        deck={editingDeck}
        onClose={() => setEditingDeck(null)}
        onDecksUpdated={loadDecks}
      />
    </SafeAreaView>
  );
}
