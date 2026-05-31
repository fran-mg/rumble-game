import { ChevronUp } from "lucide-react-native";
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import DevToolsDrawer from "./_DevToolsDrawer";
import { useDevDrawer } from "./DevDrawer.hooks";
import { styles } from "./DevDrawer.styles";

export default function DevDrawer() {
  const {
    isDrawerOpen,
    drawerTranslateY,
    arrowRotation,
    toggleDrawer,
    onDrawerBodyLayout,
  } = useDevDrawer();

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: drawerTranslateY }] },
      ]}
      pointerEvents="box-none"
    >
      {/* Arrow tab — naturally sits on top of the drawer body in the column */}
      <TouchableOpacity onPress={toggleDrawer} activeOpacity={0.75}>
        <View style={[styles.arrowTab, isDrawerOpen && styles.arrowTabOpen]}>
          <View style={styles.arrowTabLabel}>
            {!isDrawerOpen && <Text style={styles.arrowTabText}>DEV</Text>}
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <ChevronUp color="#ef4444" size={20} strokeWidth={3} />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Drawer body — measures itself to drive the translation */}
      <View
        style={styles.drawerBody}
        pointerEvents="auto"
        onLayout={(e) => onDrawerBodyLayout(e.nativeEvent.layout.height)}
      >
        <DevToolsDrawer />
      </View>
    </Animated.View>
  );
}
