const API_BASE_URL = "/api";

export async function fetchSignalData() {
  const response = await fetch(`${API_BASE_URL}/cinema/next-release`);
  return response.json();
}
