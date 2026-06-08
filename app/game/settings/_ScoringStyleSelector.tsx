import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScoringStyle } from "../../../stores/useGameStore";
import { ModeAccent } from "../../../utils/_modeTheme";
import TargetLimitInput from "./_TargetLimitInput";

// ─── DEV ─────────────────────────────────────────────────────────────────────
// "rounds" | "boardgame" to force a scoring style, or null to allow player to choose freely.
const DEV_LOCK_SCORING_STYLE: ScoringStyle | null = "rounds"; // "rounds" | "boardgame" | null
// ─────────────────────────────────────────────────────────────────────────────

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
  const lockScoringStyle = DEV_LOCK_SCORING_STYLE ?? undefined;
  const isLocked = lockScoringStyle !== undefined;

  React.useEffect(() => {
    if (isLocked && scoringStyle !== lockScoringStyle) {
      onScoringStyleChange(lockScoringStyle!);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const options = [
    {
      value: "rounds" as ScoringStyle,
      label: "Rounds",
      Icon: LucideIcons.RefreshCw,
    },
    {
      value: "boardgame" as ScoringStyle,
      label: "Board Game",
      Icon: LucideIcons.LayoutGrid,
    },
  ] as const;

  return (
    <View style={styles.card}>
      <View style={styles.cardShine} pointerEvents="none" />

      <View style={styles.sectionLabelRow}>
        <LucideIcons.Trophy size={11} color="#64748b" strokeWidth={2.5} />
        <Text style={styles.sectionLabel}>Scoring Style</Text>
      </View>

      <View style={styles.toggleTrack}>
        {options.map(({ value, label, Icon }) => {
          const isActive = scoringStyle === value;
          const isDisabled = isLocked && lockScoringStyle !== value;
          const isBlocked = isLocked && !isActive;

          return (
            <TouchableOpacity
              key={value}
              onPress={() => !isBlocked && onScoringStyleChange(value)}
              activeOpacity={isBlocked ? 1 : 0.75}
              style={[
                styles.toggleOption,
                isActive
                  ? {
                      backgroundColor: accent.colorBg,
                      borderColor: accent.colorBorder,
                    }
                  : styles.toggleOptionInactive,
                isDisabled && styles.toggleOptionDisabled,
              ]}
            >
              <Icon
                size={13}
                color={isActive ? accent.colorMuted : "#475569"}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: isActive ? accent.colorMuted : "#475569" },
                ]}
              >
                {label}
              </Text>
              {isLocked && isActive && (
                <LucideIcons.Lock
                  size={10}
                  color={accent.colorMuted}
                  strokeWidth={2.5}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

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
  toggleOptionDisabled: {
    opacity: 0.3,
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
