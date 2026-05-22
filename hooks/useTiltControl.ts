import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

type TiltDirection = "up" | "down" | "center";

export function useTiltControl(
  isActive: boolean,
  onTiltUp: () => void, // Usually "Pass"
  onTiltDown: () => void, // Usually "Correct"
) {
  const [tilt, setTilt] = useState<TiltDirection>("center");
  const isCooldown = useRef(false);

  useEffect(() => {
    if (!isActive) {
      Accelerometer.removeAllListeners();
      return;
    }

    Accelerometer.setUpdateInterval(150); // Fast enough to feel responsive, slow enough to save battery

    const subscription = Accelerometer.addListener(({ y, z }) => {
      if (isCooldown.current) return;

      // Note: Values depend on device orientation.
      // Assuming Portrait mode: y > 0.6 is tilted back (up), y < -0.6 is tilted forward (down)
      // Assuming Landscape mode (often used for this game): z axis is primarily used.
      // We will check Y for portrait testing.

      const tiltThreshold = 0.55;

      if (y > tiltThreshold && tilt !== "up") {
        setTilt("up");
        triggerAction(onTiltUp);
      } else if (y < -tiltThreshold && tilt !== "down") {
        setTilt("down");
        triggerAction(onTiltDown);
      } else if (
        y >= -tiltThreshold &&
        y <= tiltThreshold &&
        tilt !== "center"
      ) {
        setTilt("center");
      }
    });

    return () => subscription.remove();
  }, [isActive, tilt, onTiltUp, onTiltDown]);

  const triggerAction = (action: () => void) => {
    isCooldown.current = true;
    action();
    // 800ms cooldown so they have time to bring the phone back to center
    setTimeout(() => {
      isCooldown.current = false;
    }, 800);
  };

  return tilt;
}
