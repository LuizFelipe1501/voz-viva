import { useState } from "react";
import { Paperclip } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const assuntos = [
  "Transporte Metrô",
  "Mobilidade Urbana",
  "Saúde Pública",
  "Educação",
  "Segurança",
  "Meio Ambiente",
  "Habitação",
  "Assistência Social",
  "Outros",
];

export default function ManifestarAssuntoPage() {
  const { t } = useTranslation();
  const [assunto, setAssunto] = useState("");
  const [buscaAssunto, setBuscaAssunto] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get data from previous step
  const texto = location.state?.texto || "";
  const anexos = location.state?.anexos || [];
  const anonima = location.state?.anonima || false;

  const assuntosFiltrados = assuntos.filter(a => 
    a.toLowerCase().includes(buscaAssunto.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!assunto) {
      toast({
        title: t("manifest.selectSubject"),
        description: t("manifest.selectSubjectDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t("common.error"),
          description: t("manifest.loginRequired"),
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Generate protocol number
      const protocolo = Math.random().toString(36).substring(2, 12).toUpperCase();
      
      // Save to database
      const { error } = await supabase
        .from("manifestacoes")
        .insert({
          texto,
          assunto,
          protocolo,
          anonima,
          anexos: anexos,
          user_id: user.id,
          status: "pendente",
        });

      if (error) {
        console.error("Error saving manifestation:", error);
        throw error;
      }

      toast({
        title: t("manifest.success"),
        description: `${t("manifest.protocol")}: ${protocolo}`,
      });
      
      navigate("/manifestar/confirmacao", { 
        state: { protocolo } 
      });
    } catch (error) {
      console.error("Error submitting:", error);
      toast({
        title: t("common.error"),
        description: t("manifest.errorSubmitting"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout showBackBar backLabel={t("common.back")} backTo="/manifestar">
      <div className="px-6 py-6 space-y-6">
        {/* Subject selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("manifest.chooseSubject")}
          </h3>
          <input
            type="text"
            placeholder={t("manifest.searchSubject")}
            value={buscaAssunto}
            onChange={(e) => setBuscaAssunto(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-gray-800 border-2 border-primary/30 focus:border-accent focus:outline-none"
          />
          
          {buscaAssunto.length >= 4 && (
            <div className="mt-2 space-y-2">
              {assuntosFiltrados.map((a) => (
                <button
                  key={a}
                  onClick={() => setAssunto(a)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    assunto === a 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-primary/30 text-foreground hover:bg-primary/50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
          
          {assunto && (
            <p className="mt-2 text-accent font-medium">{t("manifest.selected")}: {assunto}</p>
          )}
        </motion.div>

        {/* Attachments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-2">{t("manifest.attachments")}:</h3>
          <p className="text-foreground/70 text-sm mb-3">
            {t("manifest.attachDesc")}
          </p>
          
          <label className="action-btn inline-flex items-center gap-2 cursor-pointer">
            <Paperclip className="w-5 h-5" />
            {t("manifest.attachFile")}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
          </label>

          {arquivos.length > 0 && (
            <div className="mt-3 space-y-1">
              {arquivos.map((f, i) => (
                <p key={i} className="text-foreground/80 text-sm">{f.name}</p>
              ))}
            </div>
          )}
        </motion.div>

        {/* Warning */}
        <motion.p
          className="text-warning text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("manifest.warning")}
        </motion.p>

        {/* Submit button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !assunto}
            className="action-btn"
          >
            {isSubmitting ? t("common.sending") : t("common.next")}
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
