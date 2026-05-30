import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../../stores/useGameStore";
import HistoryList from "./_HistoryList";
import Modals from "./_Modals";
import ScoreHeader from "./_ScoreHeader";

export default function RoundSummaryScreen() {
  const router = useRouter();
  const gameStore = useGameStore();
  const {
    playStyle,
    participants,
    currentTurnIndex,
    currentRound,
    targetLimit,
    turnHistory,
    turnScore,
    turnPasses,
    roundScores,
    scoringStyle,
  } = gameStore;

  const [showExitModal, setShowExitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editLimit, setEditLimit] = useState(String(targetLimit));
  const [editTimer, setEditTimer] = useState(String(gameStore.timerDuration));

  const currentEntity = participants[currentTurnIndex];

  const isLastTurnOfRound = currentTurnIndex === participants.length - 1;
  const nextRound = isLastTurnOfRound ? currentRound + 1 : currentRound;
  const hasLimit = targetLimit !== "Infinity";

  const isMatchOver =
    isLastTurnOfRound && hasLimit && currentRound >= targetLimit;
  const isNextRoundFinal =
    isLastTurnOfRound && hasLimit && nextRound === targetLimit;

  const nextEntity = participants[(currentTurnIndex + 1) % participants.length];

  const handleNext = () => {
    if (isMatchOver) {
      router.replace("/game/match-summary" as any);
    } else {
      useGameStore.setState((state) => ({
        currentTurnIndex:
          state.currentTurnIndex === participants.length - 1
            ? 0
            : state.currentTurnIndex + 1,
        currentRound:
          state.currentTurnIndex === participants.length - 1
            ? state.currentRound + 1
            : state.currentRound,
      }));
      router.replace("/game/play" as any);
    }
  };

  const handleSaveSettings = () => {
    let newLim: number | "Infinity" = "Infinity";
    if (editLimit !== "Infinity") {
      const parsed = parseInt(editLimit) || currentRound;
      if (scoringStyle === "rounds")
        newLim = Math.min(20, Math.max(currentRound, parsed));
      if (scoringStyle === "boardgame")
        newLim = Math.min(30, Math.max(5, parsed));
    }

    gameStore.updateSettingsMidGame({
      targetLimit: newLim,
      timerDuration: Math.min(180, Math.max(10, parseInt(editTimer) || 60)),
    });
    setShowSettingsModal(false);
  };

  const headerText = isLastTurnOfRound
    ? `Round ${currentRound} Complete`
    : `Round ${currentRound}`;

  const getButtonText = () => {
    if (isMatchOver) return "Reveal Final Scores";
    const entityName = nextEntity?.name ?? "Next";
    if (isNextRoundFinal) return `${entityName} Start Final Round`;
    if (isLastTurnOfRound) return `${entityName} Start Round ${nextRound}`;
    return `${entityName} Start Turn`;
  };
  const buttonText = getButtonText();

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-row justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <LucideIcons.Settings color="#94A3B8" size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowExitModal(true)}>
          <LucideIcons.DoorOpen color="#EF4444" size={28} />
        </TouchableOpacity>
      </View>

      <ScoreHeader
        headerText={headerText}
        currentEntity={currentEntity}
        roundScores={roundScores}
        turnPasses={turnPasses}
        turnScore={turnScore}
      />

      <HistoryList
        turnHistory={turnHistory}
        toggleHistoryResult={gameStore.toggleHistoryResult}
      />

      <View className="p-6 pt-2">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 rounded-2xl py-5 items-center shadow-lg"
        >
          <Text className="text-white font-black text-lg uppercase tracking-wide">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      <Modals
        showExitModal={showExitModal}
        setShowExitModal={setShowExitModal}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        editLimit={editLimit}
        setEditLimit={setEditLimit}
        editTimer={editTimer}
        setEditTimer={setEditTimer}
        currentRound={currentRound}
        scoringStyle={scoringStyle}
        handleSaveSettings={handleSaveSettings}
      />
    </SafeAreaView>
  );
}
