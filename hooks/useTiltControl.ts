// hooks/useTiltControl.ts
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
  
  // Use refs for callbacks so we don't constantly recreate the sensor listener
  const upRef = useRef(onTiltUp);
  const downRef = useRef(onTiltDown);

  useEffect(() => {
    upRef.current = onTiltUp;
    downRef.current = onTiltDown;
  }, [onTiltUp, onTiltDown]);

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
        triggerAction(downRef.current);
      } else if (z < -threshold && tilt !== "up") {
        setTilt("up");
        triggerAction(upRef.current);
      } else if (z >= -threshold && z <= threshold && tilt !== "center") {
        setTilt("center");
      }
    });

    return () => subscription.remove();
  }, [isActive, tilt]);

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
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!isActive) {
      Accelerometer.removeAllListeners();
      return;
    }

    Accelerometer.setUpdateInterval(200);
    let triggered = false; // Prevent multiple triggers in the same cycle

    const sub = Accelerometer.addListener(({ x, z }) => {
      if (triggered) return;
      // Upright in landscape = high X gravity, Z near 0 (flat screen facing out)
      if (Math.abs(x) > 0.7 && Math.abs(z) < 0.4) {
        triggered = true; 
        onDetectedRef.current();
      }
    });

    return () => sub.remove();
  }, [isActive]);
}