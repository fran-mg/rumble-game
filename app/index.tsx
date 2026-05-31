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
import * as LucideIcons from "lucide-react-native";
import { getAllModes, getModeTheme } from "../utils/_modeTheme";

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
        {/* --- USER DECKS BUTTON --- */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/decks")}
          style={styles.decksButton}
        >
          <LucideIcons.Library color="#ffffff" size={20} />
          <Text style={styles.decksButtonText}>Manage Card Decks</Text>
        </TouchableOpacity>

        {/* --- GAME MODES --- */}
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
              <View
                style={[
                  styles.modeCardGlow,
                  { backgroundColor: accent.colorBg },
                ]}
              />
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
              <View style={styles.modeCardText}>
                <View style={styles.titleStrip}>
                  <Text style={styles.modeCardTitle}>{meta.label}</Text>
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
                </View>
                <Text style={styles.modeCardDesc}>{meta.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* --- DEV TOOLS (ONLY SHOWS IN EXPO GO / LOCAL DEV) --- */}
        {__DEV__ && (
          <View style={styles.devBox}>
            <Text style={styles.devTitle}>Developer Tools</Text>
            <View style={styles.devRow}>
              <TouchableOpacity
                onPress={() => router.push("/(dev)/round-test")}
                style={styles.devBtn}
              >
                <Text style={styles.devBtnText}>Round Test</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(dev)/match-test")}
                style={styles.devBtn}
              >
                <Text style={styles.devBtnText}>Match Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617", paddingHorizontal: 20 },
  header: { paddingTop: 16, marginBottom: 24 },
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
  scroll: { flex: 1 },
  scrollContent: { gap: 12, paddingBottom: 40 },

  decksButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
    marginBottom: 8,
  },
  decksButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },

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
  modeCardText: { flex: 1, paddingRight: 48 },
  titleStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  modeCardTitle: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
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
  },
  orientationBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // Dev Tools styles
  devBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  devTitle: {
    color: "#ef4444",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 12,
    letterSpacing: 1,
  },
  devRow: { flexDirection: "row", gap: 10 },
  devBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  devBtnText: { color: "#ffffff", fontWeight: "800" },
});
