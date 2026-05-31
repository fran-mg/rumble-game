// app/game/settings/_ScoringStyleSelector.tsx
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScoringStyle } from "../../../stores/useGameStore";
import { ModeAccent } from "../../../utils/_modeTheme";
import TargetLimitInput from "./_TargetLimitInput";

interface ScoringStyleSelectorProps {
  scoringStyle: ScoringStyle;
  onScoringStyleChange: (style: ScoringStyle) => void;
  targetLimit: number | "Infinity";
  onTargetLimitChange: (limit: number | "Infinity") => void;
  accent: ModeAccent;
}

export default function ScoringStyleSelector({
  scoringStyle,
  onScoringStyleChange,
  targetLimit,
  onTargetLimitChange,
  accent,
}: ScoringStyleSelectorProps) {
  const isRounds = scoringStyle === "rounds";

  return (
    <View style={styles.card}>
      {/* Card shine */}
      <View style={styles.cardShine} pointerEvents="none" />

      {/* Section label */}
      <View style={styles.sectionLabelRow}>
        <LucideIcons.Trophy size={11} color="#64748b" strokeWidth={2.5} />
        <Text style={styles.sectionLabel}>Scoring Style</Text>
      </View>

      {/* Rounds / Boardgame toggle */}
      <View style={styles.toggleTrack}>
        <TouchableOpacity
          onPress={() => onScoringStyleChange("rounds")}
          style={[
            styles.toggleOption,
            isRounds && {
              backgroundColor: accent.colorBg,
              borderColor: accent.colorBorder,
            },
            !isRounds && styles.toggleOptionInactive,
          ]}
          activeOpacity={0.75}
        >
          <LucideIcons.RefreshCw
            size={13}
            color={isRounds ? accent.colorMuted : "#475569"}
            strokeWidth={2.5}
          />
          <Text
            style={[
              styles.toggleText,
              { color: isRounds ? accent.colorMuted : "#475569" },
            ]}
          >
            Rounds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onScoringStyleChange("boardgame")}
          style={[
            styles.toggleOption,
            !isRounds && {
              backgroundColor: accent.colorBg,
              borderColor: accent.colorBorder,
            },
            isRounds && styles.toggleOptionInactive,
          ]}
          activeOpacity={0.75}
        >
          <LucideIcons.LayoutGrid
            size={13}
            color={!isRounds ? accent.colorMuted : "#475569"}
            strokeWidth={2.5}
          />
          <Text
            style={[
              styles.toggleText,
              { color: !isRounds ? accent.colorMuted : "#475569" },
            ]}
          >
            Board Game
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Target input row — shared component */}
      <TargetLimitInput
        scoringStyle={scoringStyle}
        targetLimit={targetLimit}
        onTargetLimitChange={onTargetLimitChange}
        accent={accent}
      />
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
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  toggleTrack: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  toggleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  toggleOptionInactive: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
});
