import Slider from "@react-native-community/slider";
import React from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function TimerSelector({
  timerDuration,
  setTimerDuration,
}: any) {
  // Allows the slider to handle its own horizontal swipes without list interruption
  const nativeGesture = Gesture.Native().shouldCancelWhenOutside(false);

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4">
      <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">
        Turn Timer
      </Text>
      <View className="items-center mb-2">
        <Text
          className={`text-4xl font-black ${timerDuration <= 20 ? "text-red-500" : "text-indigo-400"}`}
        >
          {timerDuration}s
        </Text>
      </View>
      <GestureDetector gesture={nativeGesture}>
        <View collapsable={false}>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={10}
            maximumValue={180}
            step={5}
            value={timerDuration}
            onValueChange={setTimerDuration}
            minimumTrackTintColor={timerDuration <= 20 ? "#EF4444" : "#6366F1"}
            maximumTrackTintColor="#1E293B"
            thumbTintColor="#FFFFFF"
          />
        </View>
      </GestureDetector>
    </View>
  );
}
