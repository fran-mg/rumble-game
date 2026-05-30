import Slider from "@react-native-community/slider";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TimerSelectorProps {
  timerDuration: number;
  setTimerDuration: (val: number) => void;
  accent: {
    color: string;
    colorMuted: string;
    colorBg: string;
    colorBorder: string;
  };
}

export default function TimerSelector({
  timerDuration,
  setTimerDuration,
  accent,
}: TimerSelectorProps) {
  const isLow = timerDuration <= 20;
  const pct = (timerDuration - 10) / (180 - 10);

  // Interpolate track color: low=red, mid=amber, normal=accent
  const trackColor = isLow
    ? "#ef4444"
    : timerDuration <= 60
      ? accent.color
      : accent.color;

  return (
    <View style={styles.card}>
      <View style={styles.cardShine} pointerEvents="none" />

      <View style={styles.sectionLabelRow}>
        <LucideIcons.Timer size={11} color="#64748b" strokeWidth={2.5} />
        <Text style={styles.sectionLabel}>Turn Timer</Text>
      </View>

      {/* Big time display */}
      <View style={styles.timeDisplay}>
        <Text
          style={[
            styles.timeNumber,
            { color: isLow ? "#ef4444" : accent.colorMuted },
          ]}
        >
          {timerDuration}
        </Text>
        <Text
          style={[
            styles.timeUnit,
            { color: isLow ? "#ef444488" : "#47556988" },
          ]}
        >
          sec
        </Text>
      </View>

      {/* Speed descriptor */}
      <View style={styles.speedRow}>
        {["Blitz", "Fast", "Standard", "Relaxed", "Chill"].map((label, i) => {
          const thresholds = [20, 45, 90, 135, 180];
          const active =
            timerDuration <= thresholds[i] &&
            (i === 0 || timerDuration > thresholds[i - 1]);
          return (
            <View key={label} style={styles.speedItem}>
              <View
                style={[
                  styles.speedDot,
                  {
                    backgroundColor: active
                      ? accent.color
                      : "rgba(255,255,255,0.08)",
                  },
                ]}
              />
              <Text
                style={[
                  styles.speedLabel,
                  { color: active ? accent.colorMuted : "#334155" },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.sliderWrapper} pointerEvents="box-none">
        <Slider
          style={{ width: "100%", height: 44 }}
          minimumValue={10}
          maximumValue={180}
          step={5}
          value={timerDuration}
          onValueChange={setTimerDuration}
          minimumTrackTintColor={trackColor}
          maximumTrackTintColor="rgba(255,255,255,0.07)"
          thumbTintColor="#ffffff"
        />
      </View>

      {/* Tick marks */}
      <View style={styles.ticks}>
        {[10, 45, 90, 135, 180].map((mark) => (
          <Text
            key={mark}
            style={[
              styles.tick,
              timerDuration === mark && {
                color: accent.colorMuted,
                fontWeight: "800",
              },
            ]}
          >
            {mark}s
          </Text>
        ))}
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
  timeDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    marginBottom: 16,
  },
  timeNumber: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 60,
  },
  timeUnit: {
    fontSize: 18,
    fontWeight: "700",
    paddingBottom: 8,
    letterSpacing: 1,
  },
  speedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  speedItem: {
    alignItems: "center",
    gap: 4,
  },
  speedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  speedLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sliderWrapper: {
    marginHorizontal: -4,
  },
  ticks: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 2,
  },
  tick: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "600",
  },
});
