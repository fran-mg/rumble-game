import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

type TiltDirection = "up" | "down" | "center";

export function useTiltControl(
  isActive: boolean,
  onTiltUp: () => void, // Face to Sky -> Pass
  onTiltDown: () => void, // Face to Floor -> Correct
) {
  const [tilt, setTilt] = useState<TiltDirection>("center");
  const isCooldown = useRef(false);

  useEffect(() => {
    if (!isActive) {
      Accelerometer.removeAllListeners();
      return;
    }

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ z }) => {
      if (isCooldown.current) return;

      // In Landscape:
      // z > 0.45 means phone screen is tilting towards the floor
      // z < -0.45 means phone screen is tilting towards the ceiling
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
    // Shorter cooldown for fast frantic party gameplay
    setTimeout(() => {
      isCooldown.current = false;
    }, 400);
  };

  return tilt;
}

// Standalone function to detect when phone is held to forehead
export function useForeheadDetector(isActive: boolean, onDetected: () => void) {
  useEffect(() => {
    if (!isActive) {
      Accelerometer.removeAllListeners();
      return;
    }

    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener(({ x, z }) => {
      // Upright in landscape = high X gravity, Z near 0 (flat screen facing out)
      if (Math.abs(x) > 0.7 && Math.abs(z) < 0.4) {
        onDetected();
      }
    });

    return () => sub.remove();
  }, [isActive, onDetected]);
}
