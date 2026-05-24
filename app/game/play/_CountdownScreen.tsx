import React from "react";
import { Text, View } from "react-native";

interface CountdownScreenProps {
  entityName: string;
  countdown: number;
}

export default function CountdownScreen({
  entityName,
  countdown,
}: CountdownScreenProps) {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center">
      <Text className="text-white text-3xl font-bold mb-4">
        {entityName}'s Turn
      </Text>
      <Text className="text-white text-9xl font-black">{countdown}</Text>
      <Text className="text-slate-400 mt-8 text-lg font-medium">
        Get Ready!
      </Text>
    </View>
  );
}
