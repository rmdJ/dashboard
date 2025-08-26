import { useState, useEffect } from "react";
import { useCreateFiche, useUpdateFiche, type Fiche } from "@/hooks/useFiches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FicheModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiche?: Fiche | null;
  mode: "create" | "edit";
}

export const FicheModal = ({ isOpen, onClose, fiche, mode }: FicheModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createFiche = useCreateFiche();
  const updateFiche = useUpdateFiche();

  const isLoading = createFiche.isPending || updateFiche.isPending;

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && fiche) {
        setTitle(fiche.title);
        setContent(fiche.content);
      } else {
        setTitle("");
        setContent("");
      }
    }
  }, [isOpen, mode, fiche]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      if (mode === "create") {
        await createFiche.mutateAsync({
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Fiche créée avec succès");
      } else if (mode === "edit" && fiche) {
        await updateFiche.mutateAsync({
          id: fiche.id,
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Fiche modifiée avec succès");
      }
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Créer une fiche" : "Modifier la fiche"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Titre de la fiche"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                maxLength={255}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                placeholder="Contenu de la fiche"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                rows={10}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Créer" : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};