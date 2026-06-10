import { useEffect } from "react";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";
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
let isPreloading = false;

if (__DEV__) {
  unloadSounds();
}

export async function preloadSounds() {
  if (isInitialized || isPreloading) return;
  isPreloading = true;

  // 1. ISOLATED: If Android blocks this permission, we catch it and move on.
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  } catch (e) {
    console.log("[Sound] setAudioModeAsync skipped (normal on Android):", e);
  }

  const keys = Object.keys(SOUNDS) as SoundKey[];

  // 2. ISOLATED: Wrap each sound so one failure doesn't silence the whole game
  for (const key of keys) {
    try {
      const asset = Asset.fromModule(SOUNDS[key]);

      if (!asset.localUri) {
        await asset.downloadAsync();
      }

      const uri = asset.localUri || asset.uri;
      if (!uri) continue;

      if (!pools[key]) {
        pools[key] = { players: [], index: 0 };
      }

      const size = POOL_SIZES[key];
      for (let i = 0; i < size; i++) {
        // Raw string passed safely
        pools[key]!.players.push(createAudioPlayer(uri));
      }
    } catch (err) {
      console.warn(`[Sound] Failed to load ${key}:`, err);
    }
  }

  // 3. Mark as initialized even if some skipped, so the app doesn't infinite loop
  isInitialized = true;
  isPreloading = false;
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
