import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ModeHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Select Game Mode</Text>
      <Text style={styles.subtitle}>
        Choose a mode below to enter match settings, then start your game.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 36,
    marginBottom: 20,
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
});
