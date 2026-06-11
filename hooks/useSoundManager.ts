import { useEffect } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Asset } from "expo-asset";

const SOUNDS = {
  correct: require("../assets/audio/correct.m4a"),
  pass: require("../assets/audio/pass.m4a"),
  countdown: require("../assets/audio/countdown-3-ticks-go.m4a"),
  time_up: require("../assets/audio/time_up_buzzer.m4a"),
  score_reveal: require("../assets/audio/soft_score_reveal.m4a"),
  click: require("../assets/audio/click.m4a"),
  bin: require("../assets/audio/bin.m4a"),
  download: require("../assets/audio/download_staple.m4a"),
} as const;

export type SoundKey = keyof typeof SOUNDS;

let isInitialized = false;

export async function preloadSounds() {
  if (isInitialized) return;

  // 1. Safe Audio Mode setting (isolated so it doesn't crash the pipeline)
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  } catch (e) {
    console.log("[Sound] setAudioMode skipped (normal on Android):", e);
  }

  // 2. The Magic Bullet for APKs and OTA Updates
  // This explicitly tells the Expo bundler to download and cache every audio
  // file into the device memory, regardless of whether it's an APK or an update.
  try {
    const modules = Object.values(SOUNDS);
    await Asset.loadAsync(modules);
    isInitialized = true;
  } catch (err) {
    console.warn("[Sound] Failed to cache assets:", err);
  }
}

export function playSound(key: SoundKey) {
  if (!isInitialized) {
    preloadSounds();
  }

  try {
    // 3. On-Demand Playback
    // Because Asset.loadAsync already cached the files, this executes with
    // zero latency. We pass the module ID directly, bypassing all string bugs.
    const player = createAudioPlayer(SOUNDS[key]);
    player.play();

    // 4. Safe Cleanup
    // Automatically destroys the native player 4 seconds later to prevent memory
    // leaks, without relying on unstable native event listeners.
    setTimeout(() => {
      try {
        player.remove();
      } catch {}
    }, 4000);
  } catch (e) {
    console.warn(`[Sound] playSound("${key}") failed:`, e);
  }
}

export function useSoundManager() {
  useEffect(() => {
    preloadSounds();
  }, []);
  return { playSound };
}

export function unloadSounds() {
  isInitialized = false;
}
