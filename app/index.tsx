import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllModes, getModeTheme } from "../utils/_modeTheme";
import DevToolsDrawer from "./_DevToolsDrawer";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// true = user view, false = show dev tools
const isProductionTest = false;

const TAB_HEIGHT = 80;

export default function HomeScreen() {
  const router = useRouter();
  const modes = getAllModes();

  const drawerAnim = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dynamic drawer height measured from content
  const [drawerContentHeight, setDrawerContentHeight] = useState(0);
  const DRAWER_EXTRA_PADDING = 32;
  const drawerBodyHeight = drawerContentHeight + DRAWER_EXTRA_PADDING;
  const totalDrawerHeight = drawerBodyHeight + TAB_HEIGHT;

  const toggleDrawer = () => {
    const opening = !isOpenRef.current;
    isOpenRef.current = opening;
    setIsDrawerOpen(opening);
    Animated.spring(drawerAnim, {
      toValue: opening ? 1 : 0,
      friction: 16,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerBodyHeight, 0],
  });

  const arrowRotation = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Game Mode</Text>
        <Text style={styles.subtitle}>
          Choose a mode below to enter match settings, then start your game.
        </Text>
      </View>

      {/* ── Body: mode list + decks button fills remaining space ── */}
      <View style={styles.body}>
        {/* Mode cards — only scroll if they overflow */}
        <ScrollView
          style={styles.modesScroll}
          contentContainerStyle={styles.modesScrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
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
        </ScrollView>

        {/* ── Decks button — positioned lower in remaining space ── */}
        <View style={styles.decksWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/decks")}
            style={styles.decksButton}
          >
            <View style={styles.decksButtonGlow} />
            <View style={styles.decksButtonIcon}>
              <LucideIcons.Library color="#94a3b8" size={20} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.decksButtonText}>Card Decks</Text>
              <Text style={styles.decksButtonSub}>Manage & create packs</Text>
            </View>
            <LucideIcons.ChevronRight
              color="#475569"
              size={18}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Dev Tools drawer ── */}
      {__DEV__ && !isProductionTest && (
        <Animated.View
          style={[
            styles.devDrawerContainer,
            {
              height: totalDrawerHeight,
              transform: [{ translateY: drawerTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Arrow tab */}
          <TouchableOpacity
            onPress={toggleDrawer}
            activeOpacity={0.75}
            style={styles.devArrowTab}
          >
            <View
              style={[
                styles.devArrowTabInner,
                isDrawerOpen && styles.devArrowTabInnerOpen,
              ]}
              pointerEvents="none"
            >
              <View style={styles.devArrowTabLabel}>
                {!isDrawerOpen && (
                  <Text style={styles.devArrowTabText}>DEV</Text>
                )}
                <Animated.View
                  style={{ transform: [{ rotate: arrowRotation }] }}
                >
                  <LucideIcons.ChevronUp
                    color="#ef4444"
                    size={20}
                    strokeWidth={3}
                  />
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Drawer body */}
          <View
            pointerEvents="auto"
            style={styles.drawerBody} // Add this style
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && h !== drawerContentHeight) {
                setDrawerContentHeight(h);
              }
            }}
          >
            <DevToolsDrawer />
          </View>
        </Animated.View>
      )}
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

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
  },
  modesScroll: {
    flexShrink: 1,
    flexGrow: 0,
    paddingTop: 36,
  },
  modesScrollContent: {
    gap: 12,
  },

  // ── Mode cards ────────────────────────────────────────────────────────────
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
    color: "#64748b",
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

  // ── Decks wrapper ──────────────────────────────────────────────────────
  decksWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  decksButton: {
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
  decksButtonGlow: {
    position: "absolute",
    right: -24,
    bottom: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(148,163,184,0.06)",
  },
  decksButtonIcon: {
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
  decksButtonText: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  decksButtonSub: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Dev drawer ────────────────────────────────────────────────────────────
  devDrawerContainer: {
    position: "absolute",
    bottom: -20,
    left: 0, // Changed from -20
    right: 0, // Changed from -20
  },
  devArrowTab: {
    position: "absolute",
    top: 0, // Changed from 15 to align better
    alignSelf: "center",
    zIndex: 10,
    // Add explicit hit slop for easier tapping
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  devArrowTabInner: {
    backgroundColor: "#1c0808",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
    minWidth: 80,
  },
  devArrowTabInnerOpen: {
    paddingTop: 7,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  devArrowTabLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  devArrowTabText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  drawerBody: {
    marginTop: TAB_HEIGHT,
  },
});
