export const weeks = () => {
  const currentDate = new Date();
  return Array.from({ length: 4 }, (_, index) => {
    const weekDate = new Date(currentDate);
    weekDate.setDate(weekDate.getDate() + index * 7);
    return weekDate;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reduceArray(array: any, percentage: number) {
  if (!Array.isArray(array)) {
    throw new Error("Le premier argument doit être un tableau.");
  }
  if (typeof percentage !== "number" || percentage <= 0 || percentage > 100) {
    throw new Error("Le pourcentage doit être un nombre entre 0 et 100.");
  }

  // Calcul du nombre d'éléments à conserver
  const itemsToKeep = Math.ceil((percentage / 100) * array.length);

  // Générer un tableau des indices à conserver
  const indices = Array.from({ length: array.length }, (_, i) => i);
  const selectedIndices = indices
    .sort(() => Math.random() - 0.5)
    .slice(0, itemsToKeep);

  // Créer le tableau réduit en fonction des indices sélectionnés
  return selectedIndices.map((index) => array[index]);
}
