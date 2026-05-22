import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../constants/Colors";
import { useTiltControl } from "../../hooks/useTiltControl";
import { useGameStore } from "../../stores/useGameStore";
// import * as Haptics from 'expo-haptics'; // Implement haptics later if requested

export default function PlayScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const {
    cardsInRound,
    currentCardIndex,
    timeRemaining,
    isPaused,
    decrementTime,
    nextCard,
    recordCardResult,
    endRound,
    tiltEnabled,
  } = useGameStore();

  const [hasStarted, setHasStarted] = useState(false);
  const currentCard = cardsInRound[currentCardIndex];

  // Timer logic
  useEffect(() => {
    if (!hasStarted || isPaused || timeRemaining <= 0) {
      if (timeRemaining <= 0 && hasStarted) {
        handleRoundEnd();
      }
      return;
    }

    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isPaused, timeRemaining]);

  const handleCorrect = async () => {
    if (!currentCard || timeRemaining <= 0) return;
    // if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await recordCardResult(currentCard.id, "guessed", 0); // Need timer logic for timeSpent
    advanceCard();
  };

  const handlePass = async () => {
    if (!currentCard || timeRemaining <= 0) return;
    // if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await recordCardResult(currentCard.id, "passed", 0);
    advanceCard();
  };

  const advanceCard = () => {
    if (currentCardIndex + 1 >= cardsInRound.length) {
      // Out of cards
      handleRoundEnd();
    } else {
      nextCard();
    }
  };

  const handleRoundEnd = async () => {
    await endRound();
    router.replace("/game/summary");
  };

  // Tilt controls (only active if game is playing and tilt is enabled in settings)
  useTiltControl(
    hasStarted && !isPaused && timeRemaining > 0 && tiltEnabled,
    handlePass,
    handleCorrect,
  );

  if (!hasStarted) {
    return (
      <SafeAreaView
        className={`flex-1 items-center justify-center ${theme.background}`}
      >
        <Text className={`text-4xl font-bold mb-8 ${theme.textPrimary}`}>
          Ready?
        </Text>
        <Text
          className={`text-lg text-center px-8 mb-12 ${theme.textSecondary}`}
        >
          {tiltEnabled
            ? "Tilt screen DOWN for Correct\nTilt screen UP to Pass"
            : "Use the buttons to mark Correct or Pass"}
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-12 py-4 rounded-full"
          onPress={() => setHasStarted(true)}
        >
          <Text className="text-white text-xl font-bold">Start Round</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${theme.background} p-6`}>
      {/* Header / Timer */}
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity
          onPress={() => useGameStore.getState().setPaused(!isPaused)}
        >
          <Text className={`text-lg font-bold ${theme.accentText}`}>
            {isPaused ? "Resume" : "Pause"}
          </Text>
        </TouchableOpacity>

        <View
          className={`h-16 w-16 rounded-full items-center justify-center ${timeRemaining <= 10 ? "bg-red-500" : "bg-slate-800"}`}
        >
          <Text className="text-white text-2xl font-bold">{timeRemaining}</Text>
        </View>
      </View>

      {/* Card Display */}
      {currentCard ? (
        <View
          className={`flex-1 justify-center items-center rounded-3xl p-8 mb-8 ${theme.surface} shadow-lg border`}
        >
          <Text
            className={`text-5xl font-extrabold text-center mb-10 tracking-tight ${theme.textPrimary}`}
          >
            {currentCard.word}
          </Text>

          {/* Render Taboo words if mode requires it (parsed from JSON string) */}
          {currentCard.taboo_words && (
            <View className="w-full">
              <Text className="text-red-500 font-bold text-center mb-4 uppercase tracking-widest text-sm">
                Forbidden Words
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {JSON.parse(currentCard.taboo_words).map(
                  (word: string, i: number) => (
                    <View
                      key={i}
                      className="bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg m-1 border border-red-200 dark:border-red-800/50"
                    >
                      <Text className="text-red-700 dark:text-red-400 font-bold text-lg">
                        {word}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View
          className={`flex-1 justify-center items-center rounded-3xl p-8 mb-8 ${theme.surface}`}
        >
          <Text className={theme.textPrimary}>No more cards!</Text>
        </View>
      )}

      {/* Manual Button Controls (Fallback/Alternative) */}
      <View className="flex-row justify-between gap-4 h-24">
        <TouchableOpacity
          className="flex-1 bg-amber-500 rounded-2xl items-center justify-center active:bg-amber-600"
          onPress={handlePass}
          disabled={isPaused}
        >
          <Text className="text-white text-2xl font-bold tracking-wide">
            PASS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-green-500 rounded-2xl items-center justify-center active:bg-green-600"
          onPress={handleCorrect}
          disabled={isPaused}
        >
          <Text className="text-white text-2xl font-bold tracking-wide">
            CORRECT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
