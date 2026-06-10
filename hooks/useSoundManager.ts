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

// ── Pool sizes: rapid-fire sounds get bigger pools ────────────────────────────
const POOL_SIZES: Record<SoundKey, number> = {
  correct: 4, // Rapid-fire during gameplay
  pass: 4, // Rapid-fire during gameplay
  click: 3, // Can be clicked rapidly in UI
  bin: 2, // Moderate usage
  download: 2, // Moderate usage
  countdown: 1, // Only once per turn
  time_up: 1, // Only once per turn
  score_reveal: 1, // Only once per match
};

// ── Universal pool for ALL sounds ──────────────────────────────────────────────
type PlayerPool = {
  players: AudioPlayer[];
  index: number; // Round-robin pointer
};

const pools: Partial<Record<SoundKey, PlayerPool>> = {};
let ready = false;

function createPlayer(key: SoundKey): AudioPlayer {
  return createAudioPlayer(SOUNDS[key]);
}

function replenishPool(key: SoundKey) {
  const size = POOL_SIZES[key];
  const pool = pools[key];
  if (!pool) return;

  while (pool.players.length < size) {
    pool.players.push(createPlayer(key));
  }
}

export async function preloadSounds() {
  if (ready) return;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });

    // Create pools for ALL sounds upfront
    const keys = Object.keys(SOUNDS) as SoundKey[];
    keys.forEach((key) => {
      try {
        replenishPool(key);
      } catch (err) {
        console.warn(`[Sound] Failed to preload "${key}":`, err);
        // Continue loading other sounds even if one fails
      }
    });

    ready = true;
  } catch (err) {
    console.error("[Sound] preloadSounds failed:", err);
    // Don't set ready = true, but don't crash either
  }
}

// ── Play (now instant for ALL sounds) ──────────────────────────────────────────
export function playSound(key: SoundKey) {
  if (!ready) {
    preloadSounds(); // Safety fallback
    return;
  }

  const pool = pools[key];
  if (!pool || pool.players.length === 0) return;

  // Grab next player via round-robin
  const player = pool.players[pool.index];
  pool.index = (pool.index + 1) % pool.players.length;

  try {
    player.seekTo(0); // Rewind to start (instant on pre-created players)
    player.play();
  } catch (e) {
    console.warn(`[Sound] playSound("${key}") failed:`, e);
  }

  // For single-use sounds (countdown, time_up, score_reveal), replace the player
  // after use so it's fresh next time. For rapid sounds, just rewind is fine.
  if (POOL_SIZES[key] === 1) {
    setTimeout(() => {
      try {
        player.remove();
      } catch {}
      pool.players[
        pool.index === 0 ? pool.players.length - 1 : pool.index - 1
      ] = createPlayer(key);
    }, 5000);
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────
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
    pool.players.forEach((p) => {
      try {
        p.remove();
      } catch {}
    });
    delete pools[key];
  }
  ready = false;
}
