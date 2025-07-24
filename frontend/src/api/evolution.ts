const API_BASE_URL = "/api";

export interface EvolutionDataPoint {
  date: string;
  value: number;
  _id?: string;
}

export interface EvolutionData {
  roadTo10k: EvolutionDataPoint[];
  roadTo1btc: EvolutionDataPoint[];
}

export async function getEvolution(): Promise<EvolutionData> {
  try {
    const response = await fetch(`${API_BASE_URL}/evolution`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch evolution data");
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "API returned error");
    }
    
    return {
      roadTo10k: result.data.roadTo10k || [],
      roadTo1btc: result.data.roadTo1btc || []
    };
    
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    throw error;
  }
}