import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useForeheadDetector,
  useTiltControl,
} from "../../../hooks/useTiltControl";
import { useGameStore } from "../../../stores/useGameStore";
import ActionButtons from "./_ActionButtons";
import CountdownScreen from "./_CountdownScreen";
import PlayingCard from "./_PlayingCard";
import ProgressBar from "./_ProgressBar";
import TimeUpScreen from "./_TimeUpScreen";
import WaitingForehead from "./_WaitingForehead";

export type CardFlashState = "default" | "pass" | "done";

export default function PlayScreen() {
  const router = useRouter();
  const [dims, setDims] = useState(Dimensions.get("window"));

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setDims(window),
    );
    return () => sub?.remove();
  }, []);

  const {
    mode,
    participants,
    currentTurnIndex,
    cardsInRound,
    currentCardIndex,
    timerDuration,
    startTurn,
    endTurn,
    recordCardResult,
    nextCard,
  } = useGameStore();

  const [gameState, setGameState] = useState<
    "waiting-forehead" | "countdown" | "playing" | "timeup"
  >("countdown");
  const [countdown, setCountdown] = useState(3);
  const [flashState, setFlashState] = useState<CardFlashState>("default");
  const [displayTime, setDisplayTime] = useState(timerDuration);

  const progress = useSharedValue(1);
  const currentEntity = participants[currentTurnIndex];
  const currentCard = cardsInRound[currentCardIndex];

  useEffect(() => {
    if (mode === "headsup") {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setGameState("waiting-forehead");
    } else if (mode === "password") {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      setGameState("countdown");
    } else {
      ScreenOrientation.unlockAsync();
      setGameState("countdown");
    }
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [mode]);

  const startCountdownSequence = () => {
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
  };

  useEffect(() => {
    if (gameState === "countdown") startCountdownSequence();
  }, [gameState]);

  useForeheadDetector(gameState === "waiting-forehead", () => {
    setGameState("countdown");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  });

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
    width: progress.value * dims.width,
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

  useTiltControl(
    gameState === "playing" && flashState === "default" && mode === "headsup",
    () => handleAction("passed"),
    () => handleAction("guessed"),
  );

  if (gameState === "waiting-forehead") return <WaitingForehead />;
  if (gameState === "countdown")
    return (
      <CountdownScreen entityName={currentEntity?.name} countdown={countdown} />
    );
  if (gameState === "timeup") return <TimeUpScreen />;

  return (
    <SafeAreaView
      className="flex-1 bg-black relative"
      edges={["left", "right", "bottom"]}
    >
      <ProgressBar animatedStyle={animatedProgressStyle} />
      <View className="flex-1 pb-0 pl-0 pr-0 pt-0">
        <PlayingCard
          currentCard={currentCard}
          flashState={flashState}
          mode={mode}
          displayTime={displayTime}
        />
        {mode !== "headsup" && flashState === "default" && (
          <ActionButtons handleAction={handleAction} />
        )}
      </View>
    </SafeAreaView>
  );
}
