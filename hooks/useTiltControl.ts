import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

type TiltDirection = "up" | "down" | "center";

export function useTiltControl(
  isActive: boolean,
  onTiltUp: () => void, // Pass
  onTiltDown: () => void, // Correct
) {
  const [tilt, setTilt] = useState<TiltDirection>("center");
  const isCooldown = useRef(false);

  useEffect(() => {
    if (!isActive) {
      Accelerometer.removeAllListeners();
      return;
    }

    Accelerometer.setUpdateInterval(150);

    const subscription = Accelerometer.addListener(({ z }) => {
      if (isCooldown.current) return;

      // Forehead Landscape Math:
      // z ≈ 0 (screen vertical to floor)
      // z > 0.5 (screen tilting towards floor -> Correct)
      // z < -0.5 (screen tilting towards ceiling -> Pass)

      const threshold = 0.45;

      if (z > threshold && tilt !== "down") {
        setTilt("down");
        triggerAction(onTiltDown);
      } else if (z < -threshold && tilt !== "up") {
        setTilt("up");
        triggerAction(onTiltUp);
      } else if (z >= -threshold && z <= threshold && tilt !== "center") {
        setTilt("center");
      }
    });

    return () => subscription.remove();
  }, [isActive, tilt, onTiltUp, onTiltDown]);

  const triggerAction = (action: () => void) => {
    isCooldown.current = true;
    action();
    // Shorter cooldown for fast gameplay
    setTimeout(() => {
      isCooldown.current = false;
    }, 600);
  };

  return tilt;
}
