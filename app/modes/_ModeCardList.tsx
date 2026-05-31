import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { getAllModes } from "../../utils/_modeTheme";
import ModeCard from "./_ModeCard";

export default function ModeCardList() {
  const router = useRouter();
  const modes = getAllModes();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
    >
      {modes.map((modeKey) => (
        <ModeCard
          key={modeKey}
          modeKey={modeKey}
          onPress={() =>
            router.push({
              pathname: "/game/settings",
              params: { mode: modeKey },
            })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
    flexGrow: 0,
    paddingTop: 36,
  },
  scrollContent: {
    gap: 12,
  },
});
