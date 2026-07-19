import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PwaInstall {
  canInstall: boolean; // native prompt available (Chrome/Android/desktop)
  isStandalone: boolean; // already running as an installed app
  isIOS: boolean; // iOS Safari — needs manual "Add to Home Screen"
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

function detectStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function detectIOS(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS reports as Mac; disambiguate by touch
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit;
}

// Captures the browser's install prompt and exposes install state for a
// custom "Install app" affordance. iOS has no prompt event, so we detect it
// and the UI shows manual Add-to-Home-Screen steps.
export function usePwaInstall(): PwaInstall {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(detectStandalone);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const mq = window.matchMedia("(display-mode: standalone)");
    const onMode = () => setIsStandalone(detectStandalone());
    mq.addEventListener("change", onMode);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener("change", onMode);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
    return outcome;
  };

  return {
    canInstall: !!deferred && !isStandalone,
    isStandalone,
    isIOS: detectIOS(),
    promptInstall,
  };
}
