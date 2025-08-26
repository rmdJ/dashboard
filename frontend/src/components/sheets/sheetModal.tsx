import { useState, useEffect } from "react";
import { useCreateSheet, useUpdateSheet, type Sheet } from "@/hooks/useSheets";
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

interface SheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet?: Sheet | null;
  mode: "create" | "edit";
}

export const SheetModal = ({
  isOpen,
  onClose,
  sheet,
  mode,
}: SheetModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createSheet = useCreateSheet();
  const updateSheet = useUpdateSheet();

  const isLoading = createSheet.isPending || updateSheet.isPending;

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && sheet) {
        setTitle(sheet.title);
        setContent(sheet.content);
      } else {
        setTitle("");
        setContent("");
      }
    }
  }, [isOpen, mode, sheet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      if (mode === "create") {
        await createSheet.mutateAsync({
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Sheet créé avec succès");
      } else if (mode === "edit" && sheet) {
        await updateSheet.mutateAsync({
          id: sheet.id,
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Sheet modifié avec succès");
      }
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
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
              {mode === "create" ? "Créer un sheet" : "Modifier le sheet"}
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
