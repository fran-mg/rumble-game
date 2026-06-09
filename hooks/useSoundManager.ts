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

// ── Hot pool: pre-instantiated players ready to fire with zero delay ───────────
// Only correct and pass need this — they're the only rapid-fire sounds.
const HOT_POOL_SIZE = 4;
const hotPool: Record<"correct" | "pass", AudioPlayer[]> = {
  correct: [],
  pass: [],
};

let ready = false;

function createHotPlayer(key: "correct" | "pass"): AudioPlayer {
  return createAudioPlayer(SOUNDS[key]);
}

function replenishPool(key: "correct" | "pass") {
  while (hotPool[key].length < HOT_POOL_SIZE) {
    hotPool[key].push(createHotPlayer(key));
  }
}

export async function preloadSounds() {
  if (ready) return;

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  });

  // Fill hot pools — these players sit idle until needed
  replenishPool("correct");
  replenishPool("pass");

  ready = true;
}

// ── Play ───────────────────────────────────────────────────────────────────────
export function playSound(key: SoundKey) {
  if (!ready) preloadSounds();

  if (key === "correct" || key === "pass") {
    // Grab the next pre-warmed player from the front of the pool
    const player = hotPool[key].shift();

    if (player) {
      // Fire instantly — player is already instantiated, position is at 0
      player.play();

      // Dispose after playback, then top the pool back up with a fresh player
      setTimeout(() => {
        try {
          player.remove();
        } catch {}
        hotPool[key].push(createHotPlayer(key));
      }, 1500);
    } else {
      // Fallback: pool was somehow exhausted — fire a fresh one anyway
      const fallback = createAudioPlayer(SOUNDS[key]);
      fallback.play();
      setTimeout(() => {
        try {
          fallback.remove();
        } catch {}
      }, 1500);
    }
  } else {
    // All other sounds: create-and-fire is fine (not rapid-fire)
    try {
      const player = createAudioPlayer(SOUNDS[key]);
      player.play();
      setTimeout(() => {
        try {
          player.remove();
        } catch {}
      }, 5000);
    } catch {}
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
  Object.values(hotPool)
    .flat()
    .forEach((p) => {
      try {
        p.remove();
      } catch {}
    });
  ready = false;
}
