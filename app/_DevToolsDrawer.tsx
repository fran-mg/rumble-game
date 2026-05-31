import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DevToolsDrawer() {
  const router = useRouter();

  return (
    <View style={styles.drawer}>
      <View style={styles.drawerShine} pointerEvents="none" />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLine} />
        <View style={styles.headerCenter}>
          <LucideIcons.Terminal size={12} color="#ef4444" strokeWidth={2.5} />
          <Text style={styles.headerLabel}>Developer Tools</Text>
        </View>
        <View style={styles.headerLine} />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          onPress={() => router.push("/(dev)/round-test")}
          style={styles.devBtn}
          activeOpacity={0.75}
        >
          <LucideIcons.PlayCircle size={16} color="#f87171" strokeWidth={2} />
          <Text style={styles.devBtnLabel}>Round Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(dev)/match-test")}
          style={styles.devBtn}
          activeOpacity={0.75}
        >
          <LucideIcons.Swords size={16} color="#f87171" strokeWidth={2} />
          <Text style={styles.devBtnLabel}>Match Test</Text>
        </TouchableOpacity>
      </View>

      {/* Footer note */}
      <Text style={styles.footerNote}>Only visible in development builds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: "#160404",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    overflow: "hidden",
    gap: 0,
  },
  drawerShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(239,68,68,0.025)",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(239,68,68,0.2)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerLabel: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  devBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  devBtnLabel: {
    color: "#f87171",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerNote: {
    textAlign: "center",
    color: "rgba(239,68,68,0.3)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
