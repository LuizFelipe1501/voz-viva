import { Mail, Bell } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export default function MinhasRespostasPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: manifestacoes, isLoading } = useQuery({
    queryKey: ["minhas-manifestacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manifestacoes")
        .select(`
          *,
          respostas (id, lida, orgao, texto)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const temNotificacao = manifestacoes?.some(m => 
    m.respostas?.some(r => !r.lida)
  );

  return (
    <AppLayout showBackBar backLabel={t("common.backToHome")}>
      <div className="px-6 py-6">
        <motion.div
          className="menu-card flex-col items-start mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-card-foreground w-full text-center">
            {t("responses.title")}
          </h2>
        </motion.div>

        {/* Notification */}
        {temNotificacao && (
          <motion.div
            className="notification-badge flex items-center gap-2 w-fit mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Bell className="w-4 h-4" />
            {t("responses.notification")}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!manifestacoes || manifestacoes.length === 0) && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-foreground/70">{t("responses.noResponses")}</p>
          </motion.div>
        )}

        {/* Manifestations list */}
        {manifestacoes && manifestacoes.length > 0 && (
          <motion.div
            className="bg-primary/20 rounded-2xl p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {manifestacoes.map((manifestacao, index) => {
              const ultimaResposta = manifestacao.respostas?.[0];
              const temRespostaNaoLida = manifestacao.respostas?.some(r => !r.lida);

              return (
                <motion.div
                  key={manifestacao.id}
                  className="response-card cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/minhas-respostas/${manifestacao.id}`)}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1">
                      {manifestacao.assunto}
                    </h4>
                    <p className="text-foreground/70 text-sm line-clamp-2">
                      {ultimaResposta 
                        ? `${t("responses.respondedBy")} ${ultimaResposta.orgao}`
                        : manifestacao.texto.substring(0, 80) + "..."
                      }
                    </p>
                  </div>
                  {temRespostaNaoLida && (
                    <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
