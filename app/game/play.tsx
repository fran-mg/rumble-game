import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTiltControl } from "../../hooks/useTiltControl";
import { useGameStore } from "../../stores/useGameStore";

type CardFlashState = "default" | "pass" | "done";

export default function PlayScreen() {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");

  const {
    mode,
    playStyle,
    matchTeams,
    matchPlayers,
    currentTurnIndex,
    cardsInRound,
    currentCardIndex,
    timerDuration,
    isPaused,
    startTurn,
    endTurn,
    recordCardResult,
    nextCard,
  } = useGameStore();

  const [gameState, setGameState] = useState<
    "countdown" | "playing" | "timeup"
  >("countdown");
  const [countdown, setCountdown] = useState(3);
  const [flashState, setFlashState] = useState<CardFlashState>("default");

  // Continuous Timer
  const [displayTime, setDisplayTime] = useState(timerDuration);
  const progress = useSharedValue(1);

  const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;
  const currentEntity = activeRoster[currentTurnIndex];
  const currentCard = cardsInRound[currentCardIndex];
  const isLandscape = mode === "headsup";

  // 1. Orientation Lock
  useEffect(() => {
    if (isLandscape) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isLandscape]);

  // 2. Initial 3-2-1 Countdown
  useEffect(() => {
    startTurn();
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          setGameState("playing");
          startContinuousTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countInterval);
  }, []);

  // 3. Smooth Continuous Timer Engine
  const triggerTimeUp = () => {
    setGameState("timeup");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      endTurn();
      if (isLandscape) ScreenOrientation.unlockAsync(); // unlock before routing
      router.replace("/game/round-summary" as any); // Explicitly typecast your path parameter string to clear type cache checks
    }, 1500);
  };

  const startContinuousTimer = () => {
    progress.value = withTiming(
      0,
      { duration: timerDuration * 1000, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(triggerTimeUp)();
      },
    );

    // Fallback digit updater
    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progress.value * (isLandscape ? height : width), // Use height if rotated
  }));

  // 4. Action Handler (Brief Flashes)
  const handleAction = (action: "guessed" | "passed") => {
    if (gameState !== "playing" || flashState !== "default" || !currentCard)
      return;

    setFlashState(action === "guessed" ? "done" : "pass");
    Haptics.impactAsync(
      action === "guessed"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium,
    );
    recordCardResult(currentCard.id, currentCard.word, action);

    // BRIEF timeout (200ms)
    setTimeout(() => {
      setFlashState("default");
      if (currentCardIndex + 1 >= cardsInRound.length) {
        cancelAnimation(progress);
        triggerTimeUp();
      } else {
        nextCard();
      }
    }, 200);
  };

  // 5. Tilt Controls (Heads Up Only - Sideways logic)
  // When phone is on forehead in landscape, tilting UP (face to ceiling) = pass. DOWN (face to floor) = correct.
  useTiltControl(
    gameState === "playing" && flashState === "default" && isLandscape,
    () => handleAction("passed"),
    () => handleAction("guessed"),
  );

  // -- RENDERERS --

  if (gameState === "countdown") {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-3xl font-bold mb-4">
          {currentEntity?.name}'s Turn
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
      bg: "bg-slate-600",
      border: "border-slate-800",
      text: "text-white",
    };
  };
  const colors = getCardColors();

  return (
    <SafeAreaView className="flex-1 bg-slate-950 relative">
      {/* Continuous Timer Line */}
      <Animated.View
        className="absolute top-0 left-0 h-3 bg-blue-500 z-50"
        style={animatedProgressStyle}
      />

      {/* Spaced Card Container */}
      <View className="flex-1 p-6 pb-8">
        <View
          className={`flex-1 rounded-[40px] ${colors.bg} ${colors.border} border-4 p-2 shadow-2xl justify-center`}
        >
          {/* Inner Dashed Stitching */}
          <View
            className={`flex-1 rounded-[32px] border-4 ${colors.border} border-dashed items-center justify-center p-6 relative`}
          >
            {/* Small Top Right Countdown Digit */}
            <View className="absolute top-4 right-6">
              <Text className="text-white/80 font-black text-2xl">
                {displayTime}
              </Text>
            </View>

            {/* Word Content */}
            {flashState === "pass" ? (
              <Text className="text-white text-7xl font-black tracking-widest uppercase">
                PASS
              </Text>
            ) : flashState === "done" ? (
              <Text className="text-white text-7xl font-black tracking-widest uppercase">
                CORRECT!
              </Text>
            ) : (
              <>
                <Text
                  className={`font-black text-center ${isLandscape ? "text-8xl" : "text-5xl"} text-white border-b-4 border-white pb-3`}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                >
                  {currentCard?.word}
                </Text>

                {/* Password Mode: Stacked Forbidden Words */}
                {mode === "password" && currentCard?.taboo_words && (
                  <View className="mt-6 items-center">
                    <Text className="text-red-300 font-bold mb-3 uppercase tracking-widest text-bases ">
                      ( Forbidden )
                    </Text>
                    {JSON.parse(currentCard.taboo_words).map(
                      (w: string, i: number) => (
                        <Text
                          key={i}
                          className="text-red-400 font-bold text-4xl mb-3"
                        >
                          {w}
                        </Text>
                      ),
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Manual Buttons for Non-Landscape */}
        {!isLandscape && flashState === "default" && (
          <View className="flex-row justify-between gap-4 mt-6 h-20">
            <TouchableOpacity
              className="flex-1 bg-orange-500 rounded-2xl items-center justify-center border-b-4 border-orange-700 active:mt-1 active:border-b-0"
              onPress={() => handleAction("passed")}
            >
              <Text className="text-white text-2xl font-black tracking-wide">
                pass..
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
