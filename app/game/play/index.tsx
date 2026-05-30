// app/game/play/index.tsx
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
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
  const continuousIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Orientation Lock logic
  useEffect(() => {
    let isMounted = true;
    const applyOrientation = async () => {
      if (mode === "headsup") {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (isMounted) setGameState("waiting-forehead");
      } else if (mode === "password") {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        if (isMounted) setGameState("countdown");
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
        if (isMounted) setGameState("countdown");
      }
    };

    applyOrientation();

    return () => {
      isMounted = false;
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [mode]);

  // 2. Countdown phase isolated properly
  useEffect(() => {
    let countInterval: NodeJS.Timeout;
    
    if (gameState === "countdown") {
      startTurn();
      setCountdown(3);
      setDisplayTime(timerDuration);
      progress.value = 1; // Reset progress bar visual
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      countInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countInterval);
            setGameState("playing");
            return 0;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countInterval) clearInterval(countInterval);
    };
  }, [gameState, timerDuration, startTurn, progress]);

  // 3. Play phase execution
  useEffect(() => {
    if (gameState === "playing") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // 'GO!' Buzz
      
      progress.value = withTiming(
        0,
        { duration: timerDuration * 1000, easing: Easing.linear },
        (finished) => {
          if (finished) runOnJS(triggerTimeUp)();
        },
      );
      
      continuousIntervalRef.current = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 1) {
            if (continuousIntervalRef.current) clearInterval(continuousIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (continuousIntervalRef.current) clearInterval(continuousIntervalRef.current);
    };
  }, [gameState, timerDuration, progress]);

  const triggerTimeUp = () => {
    setGameState("timeup");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      endTurn();
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      router.replace("/game/round-summary" as any);
    }, 1500);
  };

  useForeheadDetector(gameState === "waiting-forehead", () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setGameState("countdown");
  });

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
        if (continuousIntervalRef.current) clearInterval(continuousIntervalRef.current);
        triggerTimeUp();
      } else {
        nextCard();
      }
    }, 200);
  };

  useTiltControl(
    gameState === "playing" && flashState === "default" && mode === "headsup",
    () => handleAction("passed"),   // Screen to Sky -> Pass
    () => handleAction("guessed"),  // Screen to Floor -> Correct
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
      <View className="flex-1 pb-0 pl-0 pr-0 pt-0 m-2 mb-20">
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