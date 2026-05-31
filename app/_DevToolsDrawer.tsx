import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DevToolsDrawer() {
  const router = useRouter();

  return (
    <View style={styles.drawer}>
      <View style={styles.drawerShine} pointerEvents="none" />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerDot} />
        <Text style={styles.headerLabel}>Developer Tools</Text>
        <View style={styles.headerDot} />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          onPress={() => router.push("/(dev)/round-test")}
          style={styles.devBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.devBtnLabel}>Round Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(dev)/match-test")}
          style={styles.devBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.devBtnLabel}>Match Test</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 52, // leaves room for the arrow tab above
    paddingBottom: 28,
    overflow: "hidden",
  },
  drawerShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(239,68,68,0.025)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(239,68,68,0.5)",
  },
  headerLabel: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  devBtn: {
    flex: 1,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  devBtnLabel: {
    color: "#f87171",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
