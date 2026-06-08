import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScoringStyle } from "../../../stores/useGameStore";
import { ModeAccent } from "../../../utils/_modeTheme";
import TargetLimitInput from "./_TargetLimitInput";

interface RoundsSelectorProps {
  targetLimit: number | "Infinity";
  onTargetLimitChange: (limit: number | "Infinity") => void;
  accent: ModeAccent;
}

export default function RoundsSelector({
  targetLimit,
  onTargetLimitChange,
  accent,
}: RoundsSelectorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardShine} pointerEvents="none" />

      <TargetLimitInput
        scoringStyle={"rounds" as ScoringStyle}
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
});
