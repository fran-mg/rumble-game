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

  // Real-time dimensions for orientation flips in Taboo mode
  const [dims, setDims] = useState(Dimensions.get("window"));
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setDims(window),
    );
    return () => sub?.remove();
  }, []);

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

  const [displayTime, setDisplayTime] = useState(timerDuration);
  const progress = useSharedValue(1);

  const activeRoster = playStyle === "team" ? matchTeams : matchPlayers;
  const currentEntity = activeRoster[currentTurnIndex];
  const currentCard = cardsInRound[currentCardIndex];

  // Restrict orientations based on mode
  useEffect(() => {
    if (mode === "headsup")
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    else if (mode === "password")
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    else ScreenOrientation.unlockAsync(); // Taboo can be either

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [mode]);

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

  const triggerTimeUp = () => {
    setGameState("timeup");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      endTurn();
      if (mode === "headsup") ScreenOrientation.unlockAsync();
      router.replace("/game/round-summary" as any);
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
    width: progress.value * dims.width, // Dynamically updates if orientation flips mid-turn
  }));

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

    // Fast flash for better game pacing
    setTimeout(() => {
      setFlashState("default");
      if (currentCardIndex + 1 >= cardsInRound.length) {
        cancelAnimation(progress);
        triggerTimeUp();
      } else {
        nextCard();
      }
    }, 400);
  };

  const isLandscapePhysical = dims.width > dims.height;

  useTiltControl(
    gameState === "playing" && flashState === "default" && mode === "headsup",
    () => handleAction("passed"),
    () => handleAction("guessed"),
  );

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
    <SafeAreaView
      className="flex-1 bg-black relative"
      edges={["left", "right", "bottom"]}
    >
      <Animated.View
        className="absolute top-0 left-0 h-3 bg-blue-500 z-50"
        style={animatedProgressStyle}
      />

      {/* Zero margin container filling remaining screen space */}
      <View className="flex-1 pb-0 pl-0 pr-0 pt-0">
        {/* The Playing Card */}
        <View
          className={`flex-1 rounded-[40px] ${colors.bg} ${colors.border} border-4 shadow-2xl justify-center`}
        >
          {/* Inner Stitched Border */}
          <View
            className={`flex-1 rounded-2xl border-4 ${colors.border} border-dashed items-center justify-center p-6 relative`}
          >
            <View className="absolute top-4 right-6 bg-black/20 px-4 py-1 rounded-full">
              <Text className="text-white/90 font-black text-2xl">
                {displayTime}
              </Text>
            </View>

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
                  adjustsFontSizeToFit
                  numberOfLines={3}
                  minimumFontScale={0.3}
                  className={`font-black text-center text-white ${mode === "password" ? "text-6xl mb-6 border-b-4 border-white/20 pb-4" : "text-[100px]"}`}
                >
                  {currentCard?.word}
                </Text>

                {mode === "password" && currentCard?.taboo_words && (
                  <View className="items-center w-full">
                    {JSON.parse(currentCard.taboo_words).map(
                      (w: string, i: number) => (
                        <Text
                          key={i}
                          className="text-red-300 font-bold text-4xl mb-2"
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

        {mode !== "headsup" && flashState === "default" && (
          <View className="flex-row justify-between gap-4 mt-4 h-24">
            <TouchableOpacity
              onPress={() => handleAction("passed")}
              className="flex-1 bg-orange-500 rounded-3xl items-center justify-center border-b-4 border-orange-700 active:mt-1 active:border-b-0"
            >
              <Text className="text-white text-3xl font-black tracking-wide">
                nope.
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
        )}
      </View>
    </SafeAreaView>
  );
}
