import { ChevronUp } from "lucide-react-native";
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import DevToolsDrawer from "./_DevToolsDrawer";
import { useDevDrawer } from "./DevDrawer.hooks";
import { styles } from "./DevDrawer.styles";

export default function DevDrawer() {
  const {
    isDrawerOpen,
    totalDrawerHeight,
    drawerTranslateY,
    arrowRotation,
    toggleDrawer,
    onContentLayout,
    TAB_HEIGHT,
  } = useDevDrawer();

  return (
    <Animated.View
      style={[
        styles.container,
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
        style={styles.arrowTab}
      >
        <View
          style={[
            styles.arrowTabInner,
            isDrawerOpen && styles.arrowTabInnerOpen,
          ]}
          pointerEvents="none"
        >
          <View style={styles.arrowTabLabel}>
            {!isDrawerOpen && <Text style={styles.arrowTabText}>DEV</Text>}
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <ChevronUp color="#ef4444" size={20} strokeWidth={3} />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Drawer body */}
      <View
        pointerEvents="auto"
        style={styles.drawerBody}
        onLayout={(e) => onContentLayout(e.nativeEvent.layout.height)}
      >
        <DevToolsDrawer />
      </View>
    </Animated.View>
  );
}
