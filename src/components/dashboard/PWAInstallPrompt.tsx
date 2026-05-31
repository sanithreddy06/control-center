"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "cc_pwa_install_dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneMode();
    setIsStandalone(standalone);

    if (standalone || localStorage.getItem(DISMISS_KEY) === "true") return;

    if (isIosDevice()) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowIosHint(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
          {showIosHint ? (
            <Share className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <Download className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Install Control Center</p>
          {showIosHint ? (
            <p className="mt-1 text-sm text-neutral-500">
              Tap the Share button in Safari, then choose{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Add to Home Screen
              </span>{" "}
              to open Control Center as a standalone app.
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">
              Add to your home screen for quick access as a standalone app on
              Android, iPhone, or desktop.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {!showIosHint && (
              <Button size="sm" onClick={install}>
                Install
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={dismiss}>
              {showIosHint ? "Got it" : "Not now"}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
