import { useCallback, useState } from "react";

export interface GeoCoords {
  lat: number;
  lng: number;
}

// Ported from legacy App.jsx's handleGoToMe: watchPosition (not getCurrentPosition,
// which is unreliable on iOS Safari) with an 18s manual timeout fallback and
// iOS-specific step-by-step Settings instructions, since iOS Safari's permission
// error/timeout behavior is unusually opaque to users.
export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMe = useCallback((onSuccess: (coords: GeoCoords) => void) => {
    setError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser");
      setLoading(false);
      return;
    }

    let done = false;
    let watchId: number | null = null;
    const cleanup = () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      if (done) return;
      done = true;
      cleanup();
      setLoading(false);
      onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };

    const handleFail = (err: GeolocationPositionError) => {
      if (done) return;
      done = true;
      cleanup();
      setLoading(false);
      if (err.code === 1) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setError(
          isIOS
            ? "Location permission denied.\n\nTo fix:\n1. Close this tab completely\n2. Open Settings → Safari → Advanced → Website Data\n3. Tap Edit → find & delete this site\n4. Reopen the site and tap 'Find me'\n5. Tap 'Allow' on the popup"
            : "Location permission denied. Check your browser location settings."
        );
      } else if (err.code === 2) {
        setError("Location unavailable. Check that Location Services is ON in Settings → Privacy → Location Services.");
      } else {
        setError("Location timed out. Check your signal and try again.");
      }
    };

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleFail, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 30000,
    });

    setTimeout(() => {
      if (!done) {
        done = true;
        cleanup();
        setLoading(false);
        setError(
          "No response from location services.\n\n1. Settings → Safari → Website Data → Edit → delete this site → Done\n2. Settings → Safari → Advanced → Website Data → delete this site\n3. Reload this page and tap 'Find me' again"
        );
      }
    }, 18000);
  }, []);

  return { findMe, loading, error };
}
