import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  handleAction: (action: "guessed" | "passed") => void;
}

export default function ActionButtons({ handleAction }: ActionButtonsProps) {
  return (
    <View className="flex-row justify-between gap-4 mt-4 h-24">
      <TouchableOpacity
        onPress={() => handleAction("passed")}
        className="flex-1 bg-orange-500 rounded-3xl items-center justify-center border-b-4 border-orange-700 active:mt-1 active:border-b-0"
      >
        <Text className="text-white text-3xl font-black tracking-wide">
          pass..
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleAction("guessed")}
        className="flex-1 bg-green-500 rounded-3xl items-center justify-center border-b-4 border-green-700 active:mt-1 active:border-b-0"
      >
        <Text className="text-white text-3xl font-black tracking-wide">
          got it!
        </Text>
      </TouchableOpacity>
    </View>
  );
}
