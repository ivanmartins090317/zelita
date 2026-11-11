"use client";

import { useEffect } from "react";

import { LOCATION_TIMING } from "@/modules/location/constants";
import {
  deviceLocationRequestPulseAction,
  failLocationRequestGpsAction,
  fulfillLocationRequestFromDeviceAction,
} from "@/modules/location/application/request-device-location";
import { readElderGrantedPosition } from "@/modules/elder-access/presentation/elder-confirm-home";

interface ElderLocationListenerProps {
  linkedDevice: boolean;
}

export function ElderLocationListener({ linkedDevice }: ElderLocationListenerProps) {
  useEffect(() => {
    if (!linkedDevice) return undefined;

    let cancelled = false;

    async function tick() {
      if (cancelled || document.visibilityState !== "visible") return;

      try {
        const pulse = await deviceLocationRequestPulseAction();
        if (cancelled || !pulse.shouldRead || !pulse.requestId) return;

        const fix = await readElderGrantedPosition(LOCATION_TIMING.gpsWaitMs);
        if (cancelled) return;

        if (fix) {
          await fulfillLocationRequestFromDeviceAction({
            requestId: pulse.requestId,
            fix,
          });
        } else {
          await failLocationRequestGpsAction(pulse.requestId);
        }
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.error("[elder-location-listener] tick_failed");
        }
      }
    }

    void tick();
    const interval = window.setInterval(() => {
      void tick();
    }, LOCATION_TIMING.presencePulseMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [linkedDevice]);

  return null;
}
