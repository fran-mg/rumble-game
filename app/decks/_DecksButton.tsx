import { useRouter } from "expo-router";
import { ChevronRight, Library } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DecksButton() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/decks")}
        style={styles.button}
      >
        <View style={styles.glow} />

        <View style={styles.iconWrap}>
          <Library color="#94a3b8" size={20} strokeWidth={2} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label}>Card Decks</Text>
          <Text style={styles.sublabel}>Manage &amp; create packs</Text>
        </View>

        <ChevronRight color="#475569" size={18} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    position: "absolute",
    right: -24,
    bottom: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(148,163,184,0.06)",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  sublabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
});
