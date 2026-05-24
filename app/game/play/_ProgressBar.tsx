import React from "react";
import Animated from "react-native-reanimated";

interface ProgressBarProps {
  animatedStyle: any;
}

export default function ProgressBar({ animatedStyle }: ProgressBarProps) {
  return (
    <Animated.View
      className="absolute top-0 left-0 h-3 bg-blue-500 z-50"
      style={animatedStyle}
    />
  );
}
