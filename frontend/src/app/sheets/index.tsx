import { useState } from "react";
import { useSheets, type Sheet } from "@/hooks/useSheets";
import { SheetModal } from "@/components/sheets/sheetModal";
import { SheetCard } from "@/components/sheets/sheetCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";

export const Sheets = () => {
  const { data: sheets, isLoading, error } = useSheets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateClick = () => {
    setModalMode("create");
    setEditingSheet(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (sheet: Sheet) => {
    setModalMode("edit");
    setEditingSheet(sheet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSheet(null);
  };

  // Filtrer les sheets selon le terme de recherche
  const filteredSheets = sheets?.filter(
    (sheet) =>
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Mes fiches</h1>
        <p className="text-muted-foreground">
          Gérez vos notes et mémos personnels
        </p>
      </div>
      <Button onClick={handleCreateClick} className="w-fit">
        <Plus className="mr-2 h-4 w-4" />
        Nouveau sheet
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        {renderHeader()}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        {renderHeader()}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Erreur lors du chargement des sheets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {renderHeader()}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher dans les sheets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {!filteredSheets || filteredSheets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Aucun résultat" : "Aucun sheet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Aucun sheet ne correspond à votre recherche"
                : "Commencez par créer votre premier sheet"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un sheet
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSheets.map((sheet) => (
            <SheetCard key={sheet.id} sheet={sheet} onEdit={handleEditClick} />
          ))}
        </div>
      )}

      {/* Modal */}
      <SheetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        sheet={editingSheet}
        mode={modalMode}
      />
    </div>
  );
};
