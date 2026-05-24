import React from "react";
import { Text, View } from "react-native";

export default function WaitingForehead() {
  return (
    <View className="flex-1 bg-indigo-600 items-center justify-center p-8">
      <Text className="text-white text-5xl font-black text-center mb-6">
        Place on Forehead
      </Text>
      <Text className="text-white/80 text-xl font-medium text-center">
        Hold the screen facing out
      </Text>
    </View>
  );
}
