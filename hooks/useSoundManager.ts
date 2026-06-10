import { useEffect } from "react";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";

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

// Safe pool limit that guarantees instant overlap without crashing Android's AudioFlinger
const POOL_SIZES: Record<SoundKey, number> = {
  correct: 2,
  pass: 2,
  click: 2,
  bin: 1,
  download: 1,
  countdown: 1,
  time_up: 1,
  score_reveal: 1,
};

type PlayerPool = {
  players: AudioPlayer[];
  index: number;
};

const pools: Partial<Record<SoundKey, PlayerPool>> = {};
let isInitialized = false;

// Dev-mode cleanup: Prevents the Fast Refresh NullPointerException
if (__DEV__) {
  unloadSounds();
}

export async function preloadSounds() {
  if (isInitialized) return;

  try {
    // Note: If you still get the permission warning in logcat, it's harmless,
    // but playsInSilentMode: true is what triggers it.
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });

    const keys = Object.keys(SOUNDS) as SoundKey[];

    for (const key of keys) {
      pools[key] = { players: [], index: 0 };
      const size = POOL_SIZES[key];

      for (let i = 0; i < size; i++) {
        // THE FIX: We pass the module require() ID directly.
        // Expo Audio resolves this safely inside the native C++ / Kotlin layer!
        pools[key]!.players.push(createAudioPlayer(SOUNDS[key]));
      }
    }

    isInitialized = true;
  } catch (err) {
    console.error("[Sound] Preloading pipeline aborted:", err);
  }
}

export function playSound(key: SoundKey) {
  if (!isInitialized) {
    console.warn(`[Sound] "${key}" not ready yet.`);
    preloadSounds();
    return;
  }

  const pool = pools[key];
  if (!pool || pool.players.length === 0) return;

  const player = pool.players[pool.index];
  pool.index = (pool.index + 1) % pool.players.length;

  try {
    player.seekTo(0);
    player.play();
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
  const keys = Object.keys(pools) as SoundKey[];
  for (const key of keys) {
    const pool = pools[key];
    if (!pool) continue;

    pool.players.forEach((player) => {
      try {
        player.remove();
      } catch {}
    });
    delete pools[key];
  }
  isInitialized = false;
}
