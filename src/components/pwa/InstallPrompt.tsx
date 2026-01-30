import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_PROMPT_KEY = "pwa-install-dismissed";
const DAYS_BETWEEN_PROMPTS = 7;

export function InstallPrompt() {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Check last dismissed time
    const lastDismissed = localStorage.getItem(INSTALL_PROMPT_KEY);
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DAYS_BETWEEN_PROMPTS) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show prompt for iOS after delay
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_PROMPT_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/20 text-card-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                {t("pwa.installTitle")}
              </h3>
              <p className="text-card-foreground/70">
                {t("pwa.installMessage")}
              </p>
            </div>

            {isIOS ? (
              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 text-card-foreground">
                  <Share className="w-6 h-6" />
                  <p className="text-sm">{t("pwa.iosInstructions")}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full action-btn-primary py-4 text-lg font-semibold mb-3"
              >
                {t("common.install")}
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-3 text-card-foreground/70 hover:text-card-foreground transition-colors"
            >
              {t("common.notNow")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
