import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "@/i18n";

const idiomas = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
];

const IdiomasPage = () => {
  const { t, i18n } = useTranslation();
  const selectedIdioma = getCurrentLanguage();

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
  };

  return (
    <AppLayout showBackBar backLabel={t("languages.title")} backTo="/">
      <motion.div 
        className="px-6 py-8 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-foreground/70 text-sm mb-6">
          {t("languages.selectLanguage")}
        </p>

        {idiomas.map((idioma, index) => (
          <motion.button
            key={idioma.code}
            onClick={() => handleLanguageChange(idioma.code)}
            className={cn(
              "w-full bg-card rounded-2xl p-5 flex items-center justify-between",
              "transition-all hover:scale-[1.02]",
              selectedIdioma === idioma.code && "ring-2 ring-accent"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{idioma.flag}</span>
              <span className="text-lg font-medium text-card-foreground">
                {idioma.name}
              </span>
            </div>
            {selectedIdioma === idioma.code && (
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-accent-foreground" />
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>
    </AppLayout>
  );
};

export default IdiomasPage;
