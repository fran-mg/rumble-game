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

interface TargetLimitInputProps {
  scoringStyle: ScoringStyle;
  targetLimit: number | "Infinity";
  onTargetLimitChange: (limit: number | "Infinity") => void;
  accent: ModeAccent;
  /** Minimum allowed value — pass currentRound when used mid-game */
  lockedMinRounds?: number;
}

export default function TargetLimitInput({
  scoringStyle,
  targetLimit,
  onTargetLimitChange,
  accent,
  lockedMinRounds,
}: TargetLimitInputProps) {
  const isRounds = scoringStyle === "rounds";
  const isInfinity = targetLimit === "Infinity";
  const minVal = lockedMinRounds ?? (isRounds ? 1 : 5);

  return (
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
        {lockedMinRounds !== undefined && isRounds && !isInfinity && (
          <Text style={styles.targetSub}>
            Min current round: {lockedMinRounds}
          </Text>
        )}
      </View>

      <View style={styles.targetControls}>
        {isRounds && (
          <TouchableOpacity
            onPress={() =>
              onTargetLimitChange(isInfinity ? minVal : "Infinity")
            }
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
                const cur =
                  typeof targetLimit === "number" ? targetLimit : minVal;
                onTargetLimitChange(Math.max(minVal, cur - 1));
              }}
              style={styles.stepBtn}
              activeOpacity={0.7}
            >
              <LucideIcons.Minus size={14} color="#94a3b8" strokeWidth={2.5} />
            </TouchableOpacity>

            <TextInput
              value={String(targetLimit)}
              onChangeText={(val) => {
                const parsed = parseInt(val) || minVal;
                const max = isRounds ? 20 : 30;
                onTargetLimitChange(Math.min(max, Math.max(minVal, parsed)));
              }}
              keyboardType="number-pad"
              maxLength={2}
              style={[styles.numberInput, { color: accent.colorMuted }]}
            />

            <TouchableOpacity
              onPress={() => {
                const cur =
                  typeof targetLimit === "number" ? targetLimit : minVal;
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
  );
}

const styles = StyleSheet.create({
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
  minHint: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0.3,
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
