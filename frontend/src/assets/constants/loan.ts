// Constantes pour les calculs de prêt immobilier

// Montants restants en juillet 2024 (première échéance disponible)
export const restantJuillet2024Principal = 55428.52; // Crédit principal
export const restantJuillet2024Complementaire = 96347.09; // Crédit complémentaire
export const restantJuillet2024Zero = 15383.46; // Crédit 0%

// Capital total emprunté
export const capitalTotal = 196299;

// Calcul du capital déjà remboursé depuis mai 2021
export const totalRestantJuillet2024 =
  restantJuillet2024Principal +
  restantJuillet2024Complementaire +
  restantJuillet2024Zero;

export const capitalDejaRembourseTotal = capitalTotal - totalRestantJuillet2024;

// Autres constantes utiles
export const assuranceMensuelle = 50.0;
export const chargesFixesMensuelles = 182.0; // 980€ copro + 1200€ taxe foncière = 2180€/an = 182€/mois
export const fraisNotaire = 24000;
export const apportInitial = 150000;
export const moisEcoulesAvantDonnees = 37; // De mai 2021 à juin 2024
export const loanStartMonth = "2021-05";
export const currentMonth = new Date()
  .toISOString()
  .split("T")[0]
  .split("-")
  .slice(0, 2)
  .join("-");
