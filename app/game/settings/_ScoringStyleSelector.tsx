import * as LucideIcons from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScoringStyle } from "../../../stores/useGameStore";
import { ModeAccent } from "../../../utils/_modeTheme";

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
  const isInfinity = targetLimit === "Infinity";

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

      {/* Target input row */}
      <View style={styles.targetRow}>
        <View>
          <Text style={styles.targetLabel}>
            {isRounds ? "Target Rounds" : "Tiles to Finish"}
          </Text>
          <Text style={styles.targetSub}>
            {isRounds
              ? isInfinity
                ? "Play until you decide to stop"
                : `Ends after ${targetLimit} rounds`
              : `First to tile ${targetLimit} wins`}
          </Text>
        </View>

        <View style={styles.targetControls}>
          {isRounds && (
            <TouchableOpacity
              onPress={() => onTargetLimitChange(isInfinity ? 3 : "Infinity")}
              style={[
                styles.infinityBtn,
                isInfinity && {
                  backgroundColor: accent.colorBg,
                  borderColor: accent.colorBorder,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.infinityText,
                  { color: isInfinity ? accent.colorMuted : "#475569" },
                ]}
              >
                ∞
              </Text>
            </TouchableOpacity>
          )}

          {!isInfinity && (
            <View style={styles.numberInputWrapper}>
              <TouchableOpacity
                onPress={() => {
                  const cur = typeof targetLimit === "number" ? targetLimit : 3;
                  const min = isRounds ? 1 : 5;
                  onTargetLimitChange(Math.max(min, cur - 1));
                }}
                style={styles.stepBtn}
                activeOpacity={0.7}
              >
                <LucideIcons.Minus
                  size={14}
                  color="#94a3b8"
                  strokeWidth={2.5}
                />
              </TouchableOpacity>

              <TextInput
                value={String(targetLimit)}
                onChangeText={(val) => {
                  const parsed = parseInt(val) || 1;
                  const min = isRounds ? 1 : 5;
                  const max = isRounds ? 20 : 30;
                  onTargetLimitChange(Math.min(max, Math.max(min, parsed)));
                }}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.numberInput, { color: accent.colorMuted }]}
              />

              <TouchableOpacity
                onPress={() => {
                  const cur = typeof targetLimit === "number" ? targetLimit : 3;
                  const max = isRounds ? 20 : 30;
                  onTargetLimitChange(Math.min(max, cur + 1));
                }}
                style={styles.stepBtn}
                activeOpacity={0.7}
              >
                <LucideIcons.Plus size={14} color="#94a3b8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targetLabel: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  targetSub: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "500",
  },
  targetControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infinityBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infinityText: {
    fontSize: 20,
    fontWeight: "900",
  },
  numberInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  stepBtn: {
    width: 36,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  numberInput: {
    width: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
});
