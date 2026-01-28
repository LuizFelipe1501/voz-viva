import { useState, useEffect, useRef } from "react";
import { Camera, Pencil, Check, X, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileData {
  nome: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
  email: string;
  foto_url: string | null;
}

export default function PerfilPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<ProfileData>({
    nome: "",
    data_nascimento: "",
    cpf: "",
    telefone: "",
    email: "",
    foto_url: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedPerfil, setEditedPerfil] = useState<ProfileData>(perfil);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profileData: ProfileData = {
          nome: data.nome || "",
          data_nascimento: data.data_nascimento || "",
          cpf: data.cpf || "",
          telefone: data.telefone || "",
          email: data.email || user.email || "",
          foto_url: data.foto_url,
        };
        setPerfil(profileData);
        setEditedPerfil(profileData);
      } else {
        // Create profile if it doesn't exist
        const newProfile: ProfileData = {
          nome: "",
          data_nascimento: "",
          cpf: "",
          telefone: "",
          email: user.email || "",
          foto_url: null,
        };
        setPerfil(newProfile);
        setEditedPerfil(newProfile);
        
        await supabase.from("profiles").insert({
          user_id: user.id,
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: editedPerfil.nome,
          data_nascimento: editedPerfil.data_nascimento || null,
          cpf: editedPerfil.cpf,
          telefone: editedPerfil.telefone,
          email: editedPerfil.email,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setPerfil(editedPerfil);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPerfil(perfil);
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with photo URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ foto_url: photoUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setPerfil(prev => ({ ...prev, foto_url: photoUrl }));
      setEditedPerfil(prev => ({ ...prev, foto_url: photoUrl }));
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <AppLayout showBackBar backLabel="Voltar para tela inicial">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBackBar backLabel="Voltar para tela inicial">
      <div className="px-6 py-6">
        <motion.div
          className="menu-card flex-col items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center w-full mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              Meu perfil cidadão
            </h2>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-6 w-full mb-6">
            {/* Photo with upload */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="w-32 h-32 bg-white rounded-lg border-2 border-primary/30 flex items-center justify-center overflow-hidden hover:border-primary/60 transition-colors cursor-pointer relative group"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : perfil.foto_url ? (
                  <>
                    <img
                      src={perfil.foto_url}
                      alt="Foto do perfil"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-10 h-10 text-primary/40" />
                    <span className="text-xs text-primary/60">Adicionar foto</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <span className="text-card-foreground/70 text-sm">Nome:</span>
                {isEditing ? (
                  <Input
                    value={editedPerfil.nome}
                    onChange={(e) => setEditedPerfil(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-card-foreground font-medium">{perfil.nome || "—"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <div>
              <span className="text-card-foreground/70 text-sm">Data de nascimento:</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedPerfil.data_nascimento}
                  onChange={(e) => setEditedPerfil(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-card-foreground font-medium">{formatDate(perfil.data_nascimento)}</p>
              )}
            </div>
            <div>
              <span className="text-card-foreground/70 text-sm">CPF:</span>
              {isEditing ? (
                <Input
                  value={editedPerfil.cpf}
                  onChange={(e) => setEditedPerfil(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="mt-1"
                />
              ) : (
                <p className="text-card-foreground font-medium">{perfil.cpf || "—"}</p>
              )}
            </div>
            <div>
              <span className="text-card-foreground/70 text-sm">Telefone:</span>
              {isEditing ? (
                <Input
                  value={editedPerfil.telefone}
                  onChange={(e) => setEditedPerfil(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="mt-1"
                />
              ) : (
                <p className="text-card-foreground font-medium">{perfil.telefone || "—"}</p>
              )}
            </div>
            <div>
              <span className="text-card-foreground/70 text-sm">Endereço de Email:</span>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedPerfil.email}
                  onChange={(e) => setEditedPerfil(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className="mt-1"
                />
              ) : (
                <p className="text-card-foreground font-medium">{perfil.email || "—"}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
