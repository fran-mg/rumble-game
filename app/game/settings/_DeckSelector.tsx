import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModeAccent } from "../../../utils/_modeTheme";

interface DeckSelectorProps {
  decks: any[];
  selectedDeckIds: number[];
  isDecksExpanded: boolean;
  setIsDecksExpanded: (val: boolean) => void;
  toggleDeckSelection: (id: number) => void;
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

      {isDecksExpanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.deckGrid}>
            {decks.map((deck) => {
              const isSelected = selectedDeckIds.includes(deck.id);
              return (
                <TouchableOpacity
                  key={deck.id}
                  onPress={() => toggleDeckSelection(deck.id)}
                  activeOpacity={0.75}
                  style={[
                    styles.deckChip,
                    isSelected
                      ? {
                          backgroundColor: accent.colorBg,
                          borderColor: accent.colorBorder,
                        }
                      : styles.deckChipInactive,
                  ]}
                >
                  {isSelected && (
                    <LucideIcons.Check
                      size={11}
                      color={accent.colorMuted}
                      strokeWidth={3}
                    />
                  )}
                  <Text
                    style={[
                      styles.deckChipName,
                      { color: isSelected ? accent.colorMuted : "#475569" },
                    ]}
                  >
                    {deck.name}
                  </Text>
                  <Text
                    style={[
                      styles.deckChipCount,
                      {
                        color: isSelected
                          ? `${accent.colorMuted}88`
                          : "#1e293b",
                      },
                    ]}
                  >
                    {deck.card_count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 16,
    marginBottom: 14,
  },
  deckGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deckChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  deckChipInactive: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.07)",
  },
  deckChipName: {
    fontSize: 13,
    fontWeight: "700",
  },
  deckChipCount: {
    fontSize: 11,
    fontWeight: "600",
  },
});
