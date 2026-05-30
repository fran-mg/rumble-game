// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllModes, getModeTheme } from "../../utils/_modeTheme";

export default function HomeScreen() {
  const router = useRouter();
  const modes = getAllModes();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Game Mode</Text>
        <Text style={styles.subtitle}>
          Click game mode below to enter match settings page, then start your
          game.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {modes.map((modeKey) => {
          const { accent, meta } = getModeTheme(modeKey);
          const Icon = meta.Icon;

          return (
            <TouchableOpacity
              key={modeKey}
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/game/settings",
                  params: { mode: modeKey },
                })
              }
              style={[styles.modeCard, { borderLeftColor: accent.color }]}
            >
              {/* Ambient glow */}
              <View
                style={[
                  styles.modeCardGlow,
                  { backgroundColor: accent.colorBg },
                ]}
              />

              {/* Icon */}
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: accent.colorBg,
                    borderColor: accent.colorBorder,
                  },
                ]}
              >
                <Icon size={22} color={accent.color} strokeWidth={2} />
              </View>

              {/* Text */}
              <View style={styles.modeCardText}>
                <Text style={styles.modeCardTitle}>{meta.label}</Text>
                <Text style={styles.modeCardDesc}>{meta.description}</Text>
              </View>

              {/* Orientation badge */}
              <View
                style={[
                  styles.orientationBadge,
                  {
                    backgroundColor: accent.colorBg,
                    borderColor: accent.colorBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.orientationBadgeText,
                    { color: accent.colorMuted },
                  ]}
                >
                  {meta.orientationBadge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    color: "#f1f5f9",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 40,
  },

  // ── Mode card ──────────────────────────────────────────────────────────────
  modeCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderLeftWidth: 4,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modeCardGlow: {
    position: "absolute",
    right: -24,
    bottom: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modeCardText: {
    flex: 1,
    paddingRight: 8,
  },
  modeCardTitle: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modeCardDesc: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  orientationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  orientationBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
