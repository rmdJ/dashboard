import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Sheet {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateSheetData {
  title: string;
  content: string;
}

interface UpdateSheetData {
  id: number;
  title: string;
  content: string;
}

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fonctions API
const fetchSheets = async (): Promise<Sheet[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/sheets`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des sheets');
  }
  return response.json();
};

const fetchSheet = async (id: number): Promise<Sheet> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/sheets/${id}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la sheet');
  }
  return response.json();
};

const createSheet = async (data: CreateSheetData): Promise<Sheet> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/sheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sheet: data }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? Object.values(error.errors).flat().join(', ') : 'Erreur lors de la création de la sheet');
  }
  return response.json();
};

const updateSheet = async (data: UpdateSheetData): Promise<Sheet> => {
  const { id, ...sheetData } = data;
  const response = await fetch(`${API_BASE_URL}/api/v1/sheets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sheet: sheetData }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? Object.values(error.errors).flat().join(', ') : 'Erreur lors de la modification de la sheet');
  }
  return response.json();
};

const deleteSheet = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/sheets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la sheet');
  }
};

// Hooks
export const useSheets = () => {
  return useQuery({
    queryKey: ['sheets'],
    queryFn: fetchSheets,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Pas de retry automatique
    refetchOnWindowFocus: false, // Pas de refetch au focus
    refetchOnReconnect: false, // Pas de refetch à la reconnexion
  });
};

export const useSheet = (id: number) => {
  return useQuery({
    queryKey: ['sheet', id],
    queryFn: () => fetchSheet(id),
    enabled: !!id,
  });
};

export const useCreateSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
  });
};

export const useUpdateSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSheet,
    onSuccess: (updatedSheet) => {
      queryClient.invalidateQueries({ queryKey: ['sheets'] });
      queryClient.invalidateQueries({ queryKey: ['sheet', updatedSheet.id] });
    },
  });
};

export const useDeleteSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
  });
};