import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";

export default function MatchSetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  const handleModeSelection = (mode: "headsup" | "taboo" | "password") => {
    router.push({
      pathname: "/game/settings",
      params: { mode },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-5 pt-4">
      {/* Header Section */}
      <View className="mb-8">
        <Text className="text-xs text-indigo-400 font-black uppercase tracking-widest mb-1">
          Game Configuration
        </Text>
        <Text className="text-3xl font-black text-white tracking-tight mb-2">
          Select Game Mode
        </Text>
        <Text className="text-sm font-medium text-slate-400 leading-relaxed">
          Choose a variant below to configure your custom match settings and
          team layouts.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode 1: Heads Up */}
        <TouchableOpacity
          activeOpacity={0.3}
          onPress={() => handleModeSelection("headsup")}
          className="bg-slate-900/70 border-l-4 border-l-indigo-500 border border-y-slate-800 border-r-slate-800 rounded-2xl p-5 flex-row relative shadow-xl overflow-hidden"
        >
          {/* Subtle Ambient Background Glow */}
          <View className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />

          {/* Left Side: Icon Container */}
          <View className="bg-indigo-500/10 w-12 h-12 rounded-xl items-center justify-center mr-4 mt-0.5">
            <LucideIcons.Smartphone color="#6366f1" size={24} />
          </View>

          {/* Center/Right Side: Details Text Content */}
          <View className="flex-1 pr-12">
            <Text className="text-white text-xl font-black tracking-tight mb-1">
              Heads Up
            </Text>
            <Text className="text-slate-400 text-xs font-medium leading-relaxed">
              Hold the device to your forehead. Tilt DOWN for correct, or tilt
              UP to pass. Uses a horizontal orientation layout.
            </Text>
          </View>

          {/* Top Right Aspect Ratio Badge Indicator */}
          <View className="absolute top-4 right-4 bg-indigo-500/10 px-2 py-0.5 rounded-md">
            <Text className="text-indigo-400 font-bold text-3xs uppercase tracking-wider">
              Landscape
            </Text>
          </View>
        </TouchableOpacity>

        {/* Mode 2: Taboo / Charades */}
        <TouchableOpacity
          activeOpacity={0.3}
          onPress={() => handleModeSelection("taboo")}
          className="bg-slate-900/70 border-l-4 border-l-rose-500 border border-y-slate-800 border-r-slate-800 rounded-2xl p-5 flex-row relative shadow-xl overflow-hidden"
        >
          <View className="absolute -right-8 -bottom-8 w-24 h-24 bg-rose-500/10 rounded-full blur-xl" />

          <View className="bg-rose-500/10 w-12 h-12 rounded-xl items-center justify-center mr-4 mt-0.5">
            <LucideIcons.Ban color="#f43f5e" size={24} />
          </View>

          <View className="flex-1 pr-12">
            <Text className="text-white text-xl font-black tracking-tight mb-1">
              Taboo / Charades
            </Text>
            <Text className="text-slate-400 text-xs font-medium leading-relaxed">
              Describe keywords or act them out. Tap screen buttons to score
              points or pass. Uses a standard vertical orientation.
            </Text>
          </View>

          <View className="absolute top-4 right-4 bg-rose-500/10 px-2 py-0.5 rounded-md">
            <Text className="text-rose-400 font-bold text-3xs uppercase tracking-wider">
              EITHER
            </Text>
          </View>
        </TouchableOpacity>

        {/* Mode 3: Password */}
        <TouchableOpacity
          activeOpacity={0.3}
          onPress={() => handleModeSelection("password")}
          className="bg-slate-900/70 border-l-4 border-l-emerald-500 border border-y-slate-800 border-r-slate-800 rounded-2xl p-5 flex-row relative shadow-xl overflow-hidden"
        >
          <View className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />

          <View className="bg-emerald-500/10 w-12 h-12 rounded-xl items-center justify-center mr-4 mt-0.5">
            <LucideIcons.Key color="#10b981" size={24} />
          </View>

          <View className="flex-1 pr-12">
            <Text className="text-white text-xl font-black tracking-tight mb-1">
              Password
            </Text>
            <Text className="text-slate-400 text-xs font-medium leading-relaxed">
              Give one-word clues. Forbidden words are restricted and displayed
              clearly below the main target keyword.
            </Text>
          </View>

          <View className="absolute top-4 right-4 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <Text className="text-emerald-400 font-bold text-3xs uppercase tracking-wider">
              Portrait
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
