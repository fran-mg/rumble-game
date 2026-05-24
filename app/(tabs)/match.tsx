import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";

export default function MatchSetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  // Routes straight to settings passing the mode parameter string
  const handleModeSelection = (mode: "headsup" | "taboo" | "password") => {
    router.push({
      pathname: "/game/settings",
      params: { mode },
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.background} p-6`}>
      <Text className={`text-3xl font-black mb-2 ${theme.textPrimary}`}>
        Select Game Mode
      </Text>
      <Text className={`text-base font-medium mb-8 ${theme.textSecondary}`}>
        Choose a variant below to configure your custom match settings.
      </Text>

      <ScrollView className="flex-1" contentContainerStyle={{ gap: 16 }}>
        {/* Mode 1: Heads Up */}
        <TouchableOpacity
          onPress={() => handleModeSelection("headsup")}
          className="bg-indigo-600 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Smartphone color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Heads Up
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            Hold to forehead. Tilt DOWN for correct. Tilt UP to pass.
            (Horizontal layout)
          </Text>
        </TouchableOpacity>

        {/* Mode 2: Taboo / Charades */}
        <TouchableOpacity
          onPress={() => handleModeSelection("taboo")}
          className="bg-rose-500 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Ban color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Taboo / Charades
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            Describe or act. Tap buttons to pass or score. (Vertical layout)
          </Text>
        </TouchableOpacity>

        {/* Mode 3: Password */}
        <TouchableOpacity
          onPress={() => handleModeSelection("password")}
          className="bg-emerald-600 rounded-3xl p-6 shadow-lg items-center"
        >
          <LucideIcons.Key color="white" size={40} className="mb-4" />
          <Text className="text-white text-2xl font-black tracking-tight mb-2">
            Password
          </Text>
          <Text className="text-white/80 text-center text-sm font-medium">
            One word clues. Forbidden words shown below target. (Vertical
            layout)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
