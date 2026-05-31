import { useRef, useState } from "react";
import { Animated } from "react-native";

export default function DummyRoute() {
  return null;
}

export function useDevDrawer() {
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerBodyHeight, setDrawerBodyHeight] = useState(0);

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

  // When closed: push everything down by drawerBodyHeight so only the tab peeks.
  // When open: translateY = 0, everything sits at the bottom of the screen.
  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerBodyHeight, 0],
  });

  const arrowRotation = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const onDrawerBodyLayout = (height: number) => {
    if (height > 0 && height !== drawerBodyHeight) {
      setDrawerBodyHeight(height);
    }
  };

  return {
    isDrawerOpen,
    drawerTranslateY,
    arrowRotation,
    toggleDrawer,
    onDrawerBodyLayout,
  };
}
