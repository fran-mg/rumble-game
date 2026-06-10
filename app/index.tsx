import { StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DecksButton from "./decks/_DecksButton";
import DevDrawer from "./(dev)/dev-drawer/index";
import HomeHeader from "./modes/_ModeHeader";
import ModeCardList from "./modes/_ModeCardList";
import { preloadSounds } from "../hooks/useSoundManager";

// true = user view, false = show dev tools
const isProductionTest = false;

export default function HomeScreen() {
  useEffect(() => {
    preloadSounds().catch((err) => {
      console.error("[Home] preloadSounds failed:", err);
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <HomeHeader />

      <View style={styles.body}>
        <ModeCardList />
        <DecksButton />
      </View>

      {__DEV__ && !isProductionTest && <DevDrawer />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  body: {
    flex: 1,
  },
});
