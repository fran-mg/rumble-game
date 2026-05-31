import { useRef, useState } from "react";
import { Animated } from "react-native";

const TAB_HEIGHT = 80;
const DRAWER_EXTRA_PADDING = 32;

export default function DummyRoute() {
  return null;
}

export function useDevDrawer() {
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContentHeight, setDrawerContentHeight] = useState(0);

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

  const onContentLayout = (height: number) => {
    if (height > 0 && height !== drawerContentHeight) {
      setDrawerContentHeight(height);
    }
  };

  return {
    isDrawerOpen,
    totalDrawerHeight,
    drawerTranslateY,
    arrowRotation,
    toggleDrawer,
    onContentLayout,
    TAB_HEIGHT,
  };
}
