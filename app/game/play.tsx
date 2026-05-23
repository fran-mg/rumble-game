import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTiltControl } from "../../hooks/useTiltControl";
import { useGameStore } from "../../stores/useGameStore";

type CardFlashState = "default" | "pass" | "done";

export default function PlayScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const {
    mode,
    teamsInGame,
    currentTeamIndex,
    cardsInRound,
    currentCardIndex,
    timeRemaining,
    timerDuration,
    isPaused,
    startTurn,
    endTurn,
    decrementTime,
    nextCard,
    recordCardResult,
  } = useGameStore();

  const [gameState, setGameState] = useState<
    "countdown" | "playing" | "timeup"
  >("countdown");
  const [countdown, setCountdown] = useState(3);
  const [flashState, setFlashState] = useState<CardFlashState>("default");

  const currentTeam = teamsInGame[currentTeamIndex];
  const currentCard = cardsInRound[currentCardIndex];

  // 1. Initial 3-2-1 Countdown
  useEffect(() => {
    startTurn();
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          setGameState("playing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countInterval);
  }, []);

  // 2. Main Game Timer
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (timeRemaining <= 0) {
      setGameState("timeup");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => {
        endTurn();
        router.replace("/game/round-summary");
      }, 1500); // Wait 1.5s then go to summary
      return;
    }

    const interval = setInterval(decrementTime, 1000);
    return () => clearInterval(interval);
  }, [gameState, isPaused, timeRemaining]);

  const handleAction = (action: "guessed" | "passed") => {
    if (gameState !== "playing" || flashState !== "default" || !currentCard)
      return;

    // Flash UI and Haptics
    setFlashState(action === "guessed" ? "done" : "pass");
    Haptics.impactAsync(
      action === "guessed"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium,
    );

    recordCardResult(currentCard.id, currentCard.word, action);

    // Wait for flash animation, then show next card
    setTimeout(() => {
      setFlashState("default");
      if (currentCardIndex + 1 >= cardsInRound.length) {
        // Out of cards? End round early.
        setGameState("timeup");
        endTurn();
        router.replace("/game/round-summary");
      } else {
        nextCard();
      }
    }, 600);
  };

  // 3. Tilt Controls (Only active for Heads Up)
  useTiltControl(
    gameState === "playing" && flashState === "default" && mode === "headsup",
    () => handleAction("passed"), // Tilt UP
    () => handleAction("guessed"), // Tilt DOWN
  );

  // -- RENDERERS --

  if (gameState === "countdown") {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-3xl font-bold mb-4">
          {currentTeam?.name}'s Turn
        </Text>
        <Text className="text-white text-9xl font-black">{countdown}</Text>
        <Text className="text-slate-400 mt-8 text-lg font-medium">
          Get Ready!
        </Text>
      </View>
    );
  }

  if (gameState === "timeup") {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-6xl font-black">TIME'S UP!</Text>
      </View>
    );
  }

  // Card Styles Based on Flash State
  const isLandscape = mode === "headsup";
  const getCardColors = () => {
    if (flashState === "pass")
      return {
        bg: "bg-orange-500",
        border: "border-orange-700",
        text: "text-white",
      };
    if (flashState === "done")
      return {
        bg: "bg-green-500",
        border: "border-green-700",
        text: "text-white",
      };
    return {
      bg: "bg-slate-700",
      border: "border-slate-800",
      text: "text-white",
    };
  };
  const colors = getCardColors();

  // Progress Bar Width
  const progressWidth = (timeRemaining / timerDuration) * width;

  return (
    <SafeAreaView
      className={`flex-1 bg-slate-950 ${isLandscape ? "justify-center" : ""}`}
    >
      {/* Top Progress Bar */}
      <View
        className="absolute top-0 left-0 h-2 bg-blue-500"
        style={{ width: progressWidth }}
      />

      {/* The Playing Card */}
      <View className={`flex-1 p-4 ${isLandscape ? "px-12 py-8" : ""}`}>
        <View
          className={`flex-1 rounded-3xl ${colors.bg} ${colors.border} border-4 p-2 shadow-2xl justify-center`}
        >
          {/* Inner Stitched Border */}
          <View
            className={`flex-1 rounded-2xl border-4 ${colors.border} border-dashed items-center justify-center p-6 relative`}
          >
            {/* Timer Overlay */}
            <View className="absolute top-4 right-6 bg-black/30 px-3 py-1 rounded-full">
              <Text className="text-white font-black text-xl">
                {timeRemaining}
              </Text>
            </View>

            {/* Main Word or Flash State */}
            {flashState === "pass" ? (
              <Text className="text-white text-7xl font-black tracking-widest uppercase">
                PASS
              </Text>
            ) : flashState === "done" ? (
              <Text className="text-white text-7xl font-black tracking-widest uppercase">
                DONE!
              </Text>
            ) : (
              <>
                <Text
                  className={`font-black text-center ${isLandscape ? "text-8xl" : "text-5xl"} text-white`}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                >
                  {currentCard?.word}
                </Text>

                {/* Password Mode: Forbidden Words */}
                {mode === "password" && currentCard?.taboo_words && (
                  <View className="mt-12 w-full px-4">
                    <Text className="text-red-300 font-bold text-center mb-4 uppercase tracking-widest text-sm">
                      Forbidden Clues
                    </Text>
                    <View className="flex-row flex-wrap justify-center gap-3">
                      {JSON.parse(currentCard.taboo_words).map(
                        (w: string, i: number) => (
                          <View
                            key={i}
                            className="bg-slate-900/50 px-4 py-2 rounded-xl border border-red-500/30"
                          >
                            <Text className="text-red-200 font-bold text-xl">
                              {w}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Manual Buttons for Taboo/Password Modes */}
        {!isLandscape && flashState === "default" && (
          <View className="flex-row justify-between gap-4 mt-6 h-20">
            <TouchableOpacity
              className="flex-1 bg-orange-500 rounded-2xl items-center justify-center border-b-4 border-orange-700 active:mt-1 active:border-b-0"
              onPress={() => handleAction("passed")}
            >
              <Text className="text-white text-2xl font-black tracking-wide">
                nope.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-500 rounded-2xl items-center justify-center border-b-4 border-green-700 active:mt-1 active:border-b-0"
              onPress={() => handleAction("guessed")}
            >
              <Text className="text-white text-2xl font-black tracking-wide">
                they got it!
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
