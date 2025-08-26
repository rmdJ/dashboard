import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Fiche {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateFicheData {
  title: string;
  content: string;
}

interface UpdateFicheData {
  id: number;
  title: string;
  content: string;
}

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fonctions API
const fetchFiches = async (): Promise<Fiche[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/fiches`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des fiches');
  }
  return response.json();
};

const fetchFiche = async (id: number): Promise<Fiche> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/fiches/${id}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la fiche');
  }
  return response.json();
};

const createFiche = async (data: CreateFicheData): Promise<Fiche> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/fiches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fiche: data }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? Object.values(error.errors).flat().join(', ') : 'Erreur lors de la création de la fiche');
  }
  return response.json();
};

const updateFiche = async (data: UpdateFicheData): Promise<Fiche> => {
  const { id, ...ficheData } = data;
  const response = await fetch(`${API_BASE_URL}/api/v1/fiches/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fiche: ficheData }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? Object.values(error.errors).flat().join(', ') : 'Erreur lors de la modification de la fiche');
  }
  return response.json();
};

const deleteFiche = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/fiches/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la fiche');
  }
};

// Hooks
export const useFiches = () => {
  return useQuery({
    queryKey: ['fiches'],
    queryFn: fetchFiches,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Pas de retry automatique
    refetchOnWindowFocus: false, // Pas de refetch au focus
    refetchOnReconnect: false, // Pas de refetch à la reconnexion
  });
};

export const useFiche = (id: number) => {
  return useQuery({
    queryKey: ['fiche', id],
    queryFn: () => fetchFiche(id),
    enabled: !!id,
  });
};

export const useCreateFiche = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFiche,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
    },
  });
};

export const useUpdateFiche = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFiche,
    onSuccess: (updatedFiche) => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
      queryClient.invalidateQueries({ queryKey: ['fiche', updatedFiche.id] });
    },
  });
};

export const useDeleteFiche = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteFiche,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
    },
  });
};