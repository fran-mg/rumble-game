import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeckStore } from "../../stores/useDeckStore";
import { generateDeckViaAI } from "../../utils/aiGenerator";
import {
  CloudDeckIndexItem,
  fetchCloudDecksIndex,
} from "../../utils/cloudDecks";
import { seedStarterDecksIfEmpty } from "../../utils/deckImporter";
import CloudDecksModal from "./DownloadDecks";
import EditDeckModal from "./EditDeck";

export default function DecksScreen() {
  const router = useRouter();
  const { decks, loadDecks, deleteDeck } = useDeckStore();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [editingDeck, setEditingDeck] = useState<any | null>(null);

  const [isCloudModalVisible, setIsCloudModalVisible] = useState(false);

  useEffect(() => {
    initDeckFlow();
  }, []);

  const initDeckFlow = async () => {
    await seedStarterDecksIfEmpty();
    await loadDecks();
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
      Alert.alert("Pack Created", "Your custom card pack has been added.");
    } else {
      Alert.alert("Generation Failed", result.error || "Review network logs.");
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
      {/* ── Page Header ── */}
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <LucideIcons.ChevronLeft
            color="#94a3b8"
            size={20}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageEyebrow}>Library</Text>
          <Text style={styles.pageTitle}>Card Decks</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsCloudModalVisible(true)}
          style={styles.iconBtn}
          activeOpacity={0.75}
        >
          <LucideIcons.CloudDownload
            color="#94a3b8"
            size={18}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── AI Forge Card ── */}
        <View style={styles.card}>
          <View style={styles.cardShine} pointerEvents="none" />
          <View style={styles.sectionLabelRow}>
            <LucideIcons.Sparkles size={11} color="#a78bfa" strokeWidth={2.5} />
            <Text style={[styles.sectionLabel, { color: "#a78bfa" }]}>
              AI Deck Forge
            </Text>
          </View>
          <Text style={styles.aiSubtitle}>
            Describe a theme and AI will generate a full card pack for you.
          </Text>
          <View style={styles.aiInputRow}>
            <TextInput
              placeholder="e.g. 90s Cartoons, Space Exploration..."
              placeholderTextColor="#475569"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              style={styles.aiInput}
              returnKeyType="done"
              onSubmitEditing={triggerAIGeneration}
            />
            <TouchableOpacity
              onPress={triggerAIGeneration}
              disabled={isGenerating || !aiPrompt.trim()}
              activeOpacity={0.75}
              style={[
                styles.aiForgeBtn,
                (!aiPrompt.trim() || isGenerating) && styles.aiForgeBtnDisabled,
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#a78bfa" />
              ) : (
                <LucideIcons.Zap size={16} color="#a78bfa" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Category Filter ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBar}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveTab(cat)}
              activeOpacity={0.75}
              style={[
                styles.categoryChip,
                activeTab === cat
                  ? styles.categoryChipActive
                  : styles.categoryChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: activeTab === cat ? "#e2e8f0" : "#64748b" },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Section label ── */}
        <View style={styles.sectionLabelRow}>
          <LucideIcons.Layers size={11} color="#64748b" strokeWidth={2.5} />
          <Text style={styles.sectionLabel}>
            {filteredDecks.length}{" "}
            {filteredDecks.length === 1 ? "pack" : "packs"} available
          </Text>
        </View>

        {/* ── Deck List ── */}
        {filteredDecks.map((deck) => {
          const deckIconKey = (deck as any).icon;
          const DeckIcon =
            (LucideIcons as any)[deckIconKey] || LucideIcons.Layers;
          const deckColor = (deck as any).color || "#3B82F6";

          return (
            <View key={deck.id} style={styles.deckCard}>
              <View style={styles.cardShine} pointerEvents="none" />

              <View style={styles.deckCardInner}>
                {/* Icon — full deck colour */}
                <View
                  style={[
                    styles.deckIcon,
                    {
                      backgroundColor: `${deckColor}22`,
                      borderColor: `${deckColor}44`,
                    },
                  ]}
                >
                  <DeckIcon color={deckColor} size={22} strokeWidth={2} />
                </View>

                {/* Info */}
                <View style={styles.deckInfo}>
                  <Text style={styles.deckName}>{deck.name}</Text>
                  <View style={styles.deckMetaRow}>
                    <Text style={styles.deckCategory}>{deck.category}</Text>
                    <View style={styles.deckMetaDot} />
                    <Text style={styles.deckCardCount}>
                      {deck.card_count} cards
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.deckActions}>
                  <TouchableOpacity
                    onPress={() => setEditingDeck(deck)}
                    style={styles.deckActionBtn}
                    activeOpacity={0.7}
                  >
                    <LucideIcons.Pencil
                      color="#94a3b8"
                      size={15}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteDeck(deck.id)}
                    style={[styles.deckActionBtn, styles.deckActionBtnDelete]}
                    activeOpacity={0.7}
                  >
                    <LucideIcons.Trash2
                      color="#f87171"
                      size={15}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Colour accent strip */}
              <View
                style={[styles.deckColorStrip, { backgroundColor: deckColor }]}
              />
            </View>
          );
        })}

        {filteredDecks.length === 0 && (
          <View style={styles.emptyState}>
            <LucideIcons.PackageOpen
              color="#334155"
              size={40}
              strokeWidth={1.5}
            />
            <Text style={styles.emptyStateText}>No packs in this category</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Modals ── */}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },

  // ── Page Header ──────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageEyebrow: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: "#f1f5f9",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 10,
  },

  // ── Shared card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── AI Forge ─────────────────────────────────────────────────────────────
  aiSubtitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 14,
  },
  aiInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  aiInput: {
    flex: 1,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  aiForgeBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiForgeBtnDisabled: {
    opacity: 0.35,
  },

  // ── Category filter ───────────────────────────────────────────────────────
  categoryBar: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  categoryChipInactive: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.07)",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  // ── Deck cards ────────────────────────────────────────────────────────────
  deckCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  },
  deckCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginBottom: 5,
  },
  deckMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  deckCategory: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  deckMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#334155",
  },
  deckCardCount: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },
  deckActions: {
    flexDirection: "row",
    gap: 8,
  },
  deckActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  deckActionBtnDelete: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.25)",
  },
  deckColorStrip: {
    height: 2,
    opacity: 0.6,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: 14,
  },
  emptyStateText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
