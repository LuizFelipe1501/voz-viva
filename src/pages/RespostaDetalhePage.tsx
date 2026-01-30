import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR, enUS, es, fr } from "date-fns/locale";

const getDateLocale = (lang: string) => {
  switch (lang) {
    case "en-US": return enUS;
    case "es-ES": return es;
    case "fr-FR": return fr;
    default: return ptBR;
  }
};

const statusIcons: Record<string, React.ReactNode> = {
  pendente: <Clock className="w-5 h-5" />,
  em_andamento: <AlertCircle className="w-5 h-5" />,
  resolvida: <CheckCircle className="w-5 h-5" />,
};

const statusColors: Record<string, string> = {
  pendente: "bg-warning/20 text-warning",
  em_andamento: "bg-accent/20 text-accent",
  resolvida: "bg-success/20 text-success",
};

export default function RespostaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: manifestacao, isLoading } = useQuery({
    queryKey: ["manifestacao", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manifestacoes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: respostas } = useQuery({
    queryKey: ["respostas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("respostas")
        .select("*")
        .eq("manifestacao_id", id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente": return t("responses.status.pending");
      case "em_andamento": return t("responses.status.inProgress");
      case "resolvida": return t("responses.status.resolved");
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <AppLayout showBackBar backLabel={t("common.back")} backTo="/minhas-respostas">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </AppLayout>
    );
  }

  if (!manifestacao) {
    return (
      <AppLayout showBackBar backLabel={t("common.back")} backTo="/minhas-respostas">
        <div className="px-6 py-8 text-center">
          <p className="text-foreground/70">{t("responses.noResponses")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBackBar backLabel={t("common.back")} backTo="/minhas-respostas">
      <div className="px-6 py-6 space-y-6">
        {/* Manifestation Details */}
        <motion.div
          className="menu-card flex-col items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <h2 className="text-xl font-bold text-card-foreground">
              {manifestacao.assunto}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors[manifestacao.status] || statusColors.pendente}`}>
              {statusIcons[manifestacao.status]}
              {getStatusLabel(manifestacao.status)}
            </span>
          </div>

          <p className="text-card-foreground/80 text-sm mb-4">
            {manifestacao.texto}
          </p>

          <div className="flex items-center gap-4 text-card-foreground/60 text-sm">
            <span>
              {t("manifestSubject.protocol")} {manifestacao.protocolo}
            </span>
            <span>
              {format(new Date(manifestacao.created_at), "dd MMM yyyy", {
                locale: getDateLocale(i18n.language),
              })}
            </span>
          </div>

          {manifestacao.anonima && (
            <div className="mt-3 px-3 py-1 bg-muted/30 rounded-full text-sm text-card-foreground/70">
              {t("manifest.anonymous")}
            </div>
          )}
        </motion.div>

        {/* Responses */}
        {respostas && respostas.length > 0 && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-foreground">
              {t("responses.respondedBy").replace(" por", "s")}
            </h3>

            {respostas.map((resposta, index) => (
              <motion.div
                key={resposta.id}
                className="response-card flex-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">
                      {t("responses.respondedBy")} {resposta.orgao}
                    </h4>
                    <p className="text-foreground/70 text-sm">
                      {resposta.texto}
                    </p>
                    <p className="text-foreground/50 text-xs mt-2">
                      {format(new Date(resposta.created_at), "dd MMM yyyy, HH:mm", {
                        locale: getDateLocale(i18n.language),
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
