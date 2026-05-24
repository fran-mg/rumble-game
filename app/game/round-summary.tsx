import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../stores/useGameStore";

export default function RoundSummaryScreen() {
  const router = useRouter();
  const gameStore = useGameStore();
  const {
    playStyle,
    matchTeams,
    matchPlayers,
    currentTurnIndex,
    currentRound,
    targetLimit,
    turnHistory,
    turnScore,
    turnPasses,
    roundScores,
  } = gameStore;

  const [showExitModal, setShowExitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Dynamic Edit Settings state
  const [editLimit, setEditLimit] = useState(String(targetLimit));
  const [editTimer, setEditTimer] = useState(String(gameStore.timerDuration));

  const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;
  const currentEntity = activeRoster[currentTurnIndex];

  // Logic Engine
  const isLastTurnOfRound = currentTurnIndex === activeRoster.length - 1;
  const isLastRound = targetLimit !== "Infinity" && currentRound >= targetLimit;
  const isMatchOver = isLastTurnOfRound && isLastRound;

  const nextEntity = isLastTurnOfRound
    ? activeRoster[0]
    : activeRoster[currentTurnIndex + 1];

  const handleNext = () => {
    if (isMatchOver) {
      router.replace("/game/match-summary");
    } else {
      useGameStore.setState((state) => ({
        currentTurnIndex:
          state.currentTurnIndex === activeRoster.length - 1
            ? 0
            : state.currentTurnIndex + 1,
        currentRound:
          state.currentTurnIndex === activeRoster.length - 1
            ? state.currentRound + 1
            : state.currentRound,
      }));
      router.replace("/game/play");
    }
  };

  const handleSaveSettings = () => {
    const newLim =
      editLimit === "Infinity"
        ? "Infinity"
        : Math.max(currentRound, parseInt(editLimit) || currentRound);
    gameStore.updateSettingsMidGame({
      targetLimit: newLim,
      timerDuration: Math.min(180, Math.max(10, parseInt(editTimer) || 60)),
    });
    setShowSettingsModal(false);
  };

  // Header string logic
  const headerText = isLastTurnOfRound
    ? `Round ${currentRound} Complete`
    : `Round ${currentRound}`;
  const buttonText = isMatchOver
    ? "Reveal Final Scores"
    : `${nextEntity?.name} Start Turn`;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Top Navigation Bar */}
      <View className="flex-row justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <LucideIcons.Settings color="#94A3B8" size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowExitModal(true)}>
          <LucideIcons.DoorOpen color="#EF4444" size={28} />
        </TouchableOpacity>
      </View>

      <View className="p-6 pb-2 border-b border-slate-800">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-center text-sm mb-2">
          {headerText}
        </Text>

        {/* Calculate total score for current entity up to this round */}
        <Text className="text-white text-2xl text-center mb-3">
          Total <Text className="font-medium">{currentEntity?.name}</Text>{" "}
          Score:{" "}
          <Text className="font-black text-blue-400">
            {Object.values(roundScores).reduce(
              (acc, round) => acc + (round[currentEntity.id] || 0),
              0,
            )}
          </Text>
        </Text>

        <View className="flex-row justify-center items-end gap-12 mb-4">
          <View className="items-center">
            <Text className="text-orange-500 font-black text-4xl">
              {turnPasses}
            </Text>
            <Text className="text-orange-500/80 font-bold text-xs uppercase tracking-wider">
              Passes
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-green-500 font-black text-6xl">
              {turnScore}
            </Text>
            <Text className="text-green-500/80 font-bold text-sm uppercase tracking-wider">
              Correct
            </Text>
          </View>
        </View>
      </View>

      {/* Passed / Correct List */}
      <ScrollView className="flex-1 px-6 py-4">
        {turnHistory.map((item, index) => (
          <View
            key={index}
            className="py-3 border-b border-slate-900 flex-row justify-between items-center"
          >
            <Text
              className={`text-xl font-bold ${item.result === "guessed" ? "text-green-400" : "text-orange-400 line-through opacity-70"}`}
            >
              {item.word}
            </Text>
            <Text
              className={`font-black ${item.result === "guessed" ? "text-green-500" : "text-orange-500"}`}
            >
              {item.result === "guessed" ? "+1" : "0"}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Action Button */}
      <View className="p-6">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 rounded-2xl py-5 items-center shadow-lg"
        >
          <Text className="text-white font-black text-lg uppercase tracking-wide">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- MODALS ---------------- */}

      {/* Exit Modal */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-slate-900 p-6 rounded-3xl w-full border border-slate-800">
            <Text className="text-white text-2xl font-black mb-2 text-center">
              End Match Here?
            </Text>
            <Text className="text-slate-400 text-center mb-8">
              This will skip remaining rounds and go straight to the final
              results screen.
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowExitModal(false)}
                className="flex-1 bg-slate-800 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowExitModal(false);
                  router.replace("/game/match-summary");
                }}
                className="flex-1 bg-red-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">End Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mid-Game Settings Edit Modal */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-900 p-6 rounded-t-3xl border-t border-slate-800 h-2/3">
            <Text className="text-white text-2xl font-black mb-6">
              Edit Rules
            </Text>

            <Text className="text-slate-400 font-bold mb-2">
              Target Rounds (Must be ≥ {currentRound})
            </Text>
            <TextInput
              value={editLimit}
              onChangeText={setEditLimit}
              keyboardType="number-pad"
              className="bg-slate-950 text-white p-4 rounded-xl font-bold mb-6"
            />

            <Text className="text-slate-400 font-bold mb-2">
              Timer Length (Seconds)
            </Text>
            <TextInput
              value={editTimer}
              onChangeText={setEditTimer}
              keyboardType="number-pad"
              className="bg-slate-950 text-white p-4 rounded-xl font-bold mb-8"
            />

            <View className="flex-row gap-4 mt-auto mb-8">
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                className="flex-1 bg-slate-800 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSettings}
                className="flex-1 bg-blue-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
