// app/game/settings/_DeckSelector.tsx
import * as LucideIcons from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Deck } from "../../../stores/useDeckStore";
import { ModeAccent } from "../../../utils/_modeTheme";

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckIds: string[];
  isDecksExpanded: boolean;
  setIsDecksExpanded: (val: boolean) => void;
  toggleDeckSelection: (deckId: string) => void;
  accent: ModeAccent;
}

export default function DeckSelector({
  decks = [],
  selectedDeckIds = [],
  isDecksExpanded,
  setIsDecksExpanded,
  toggleDeckSelection,
  accent,
}: DeckSelectorProps) {
  const allSelected =
    decks.length > 0 && decks.every((d) => selectedDeckIds.includes(d.id));

  return (
    <View style={styles.card}>
      <View style={styles.cardShine} pointerEvents="none" />

      {/* ── Header ── */}
      <TouchableOpacity
        onPress={() => setIsDecksExpanded(!isDecksExpanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.sectionLabelRow}>
            <LucideIcons.Layers size={11} color="#64748b" strokeWidth={2.5} />
            <Text style={styles.sectionLabel}>Decks in Play</Text>
          </View>
          <View style={styles.headerSubRow}>
            <Text style={[styles.headerCount, { color: accent.colorMuted }]}>
              {selectedDeckIds.length}
            </Text>
            <Text style={styles.headerCountLabel}>
              {selectedDeckIds.length === 1 ? "deck" : "decks"} active
            </Text>
            {allSelected && (
              <View
                style={[
                  styles.allBadge,
                  {
                    borderColor: accent.colorBorder,
                    backgroundColor: accent.colorBg,
                  },
                ]}
              >
                <Text
                  style={[styles.allBadgeText, { color: accent.colorMuted }]}
                >
                  All
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={[
            styles.chevronWrap,
            isDecksExpanded && {
              backgroundColor: accent.colorBg,
              borderColor: accent.colorBorder,
            },
          ]}
        >
          <LucideIcons.ChevronDown
            color={isDecksExpanded ? accent.colorMuted : "#475569"}
            size={16}
            strokeWidth={2.5}
            style={{
              transform: [{ rotate: isDecksExpanded ? "180deg" : "0deg" }],
            }}
          />
        </View>
      </TouchableOpacity>

      {/* ── Expanded list — seamlessly attached, scrollable ── */}
      {isDecksExpanded && (
        <>
          <View style={styles.divider} />

          {decks.length === 0 ? (
            <View style={styles.emptyState}>
              <LucideIcons.PackageOpen
                color="#334155"
                size={32}
                strokeWidth={1.5}
              />
              <Text style={styles.emptyText}>No decks available</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {decks.map((deck) => {
                const isSelected = selectedDeckIds.includes(deck.id);
                const DeckIcon =
                  (LucideIcons as any)[deck.icon] || LucideIcons.Layers;
                const deckColor = deck.color || "#3B82F6";

                return (
                  <TouchableOpacity
                    key={deck.id}
                    onPress={() => toggleDeckSelection(deck.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.deckRow,
                      isSelected
                        ? {
                            backgroundColor: accent.colorBg,
                            borderColor: accent.colorBorder,
                          }
                        : styles.deckRowInactive,
                    ]}
                  >
                    {/* Icon - uses accent color when selected, deck color when not */}
                    <View
                      style={[
                        styles.deckIcon,
                        isSelected
                          ? {
                              backgroundColor: accent.colorBg,
                              borderColor: accent.colorBorder,
                            }
                          : {
                              backgroundColor: `${deckColor}22`,
                              borderColor: `${deckColor}44`,
                            },
                      ]}
                    >
                      <DeckIcon
                        color={isSelected ? accent.color : deckColor}
                        size={18}
                        strokeWidth={2}
                      />
                    </View>

                    {/* Info */}
                    <View style={styles.deckInfo}>
                      <Text
                        style={[
                          styles.deckName,
                          isSelected && { color: accent.colorMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {deck.name}
                      </Text>
                      <Text
                        style={[
                          styles.deckMeta,
                          isSelected && { color: `${accent.colorMuted}99` },
                        ]}
                      >
                        {deck.category}
                        {"  ·  "}
                        {deck.cardCount}{" "}
                        {deck.cardCount === 1 ? "card" : "cards"}
                      </Text>
                    </View>

                    {/* Checkbox */}
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && {
                          backgroundColor: accent.color,
                          borderColor: accent.color,
                        },
                      ]}
                    >
                      {isSelected && (
                        <LucideIcons.Check
                          size={12}
                          color="#fff"
                          strokeWidth={3}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Outer card — same bg as the list so they read as one block ────────────
  card: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
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

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    gap: 4,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerCount: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerCountLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  allBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  allBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 16,
    marginBottom: 14,
  },

  // ── Scrollable list — no extra wrapper bg so it blends with card ──────────
  listScroll: {
    maxHeight: 280,
  },
  listContent: {
    gap: 6,
  },

  // ── Deck rows ─────────────────────────────────────────────────────────────
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  deckRowInactive: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.07)",
  },
  deckIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  deckMeta: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── Empty ─────────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
  },
  emptyText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
});
