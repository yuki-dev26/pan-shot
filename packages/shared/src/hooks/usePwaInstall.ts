"use client";

import { useCallback, useEffect, useState } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const isIOSDevice =
      /iPhone|iPad|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const isInStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isInApp =
      !/Chrome/.test(navigator.userAgent) &&
      !/Safari/.test(navigator.userAgent);
    const isMacSafariBrowser =
      /Macintosh/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);

    setIsIOS(isIOSDevice);
    setIsMacSafari(isMacSafariBrowser);
    setIsInAppBrowser(isInApp);

    if (isInStandaloneMode) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return outcome === "accepted";
    } catch {
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  return {
    deferredPrompt,
    isInstalled,
    isInstalling,
    isIOS,
    isMacSafari,
    isInAppBrowser,
    canPrompt: deferredPrompt != null,
    install,
  };
}

export type PwaInstallState = ReturnType<typeof usePwaInstall>;
