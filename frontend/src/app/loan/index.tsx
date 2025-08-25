import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, Calendar, DollarSign } from "lucide-react";

// Import your JSON files
import creditPrincipal from "@/data/loan/main.json";
import creditComplementaire from "@/data/loan/other_main.json";
import creditZero from "@/data/loan/zero_percent.json";

interface MonthlyPayment {
  date: string;
  formattedDate: string;
  mensualite: number;
  assurance: number;
  montantRembourse: number;
  montantPaye: number;
  moyenneMensuelle: number;
}

const columnHelper = createColumnHelper<MonthlyPayment>();

const CreditsTable: React.FC = () => {
  // Traitement des données pour créer le tableau mensuel combiné
  const monthlyData = useMemo(() => {
    const data: MonthlyPayment[] = [];
    const assuranceMensuelle = 50.0;

    // Capital déjà remboursé depuis mai 2021
    // Calcul basé sur les montants "restant" de juillet 2024 (première échéance disponible)
    const restantJuillet2024Principal = 55428.52; // Crédit principal
    const restantJuillet2024Complementaire = 96347.09; // Crédit complémentaire
    const restantJuillet2024Zero = 15383.46; // Crédit 0%

    const totalRestantJuillet2024 =
      restantJuillet2024Principal +
      restantJuillet2024Complementaire +
      restantJuillet2024Zero;
    const capitalDejaRembourseTotal = 196299 - totalRestantJuillet2024; // Capital déjà payé = Total - Restant

    // Montant déjà payé en intérêts et assurance depuis mai 2021 (estimation)
    const moisEcoules = 37; // De mai 2021 à juin 2024
    const assuranceDejaPayee = moisEcoules * assuranceMensuelle; // 37 * 50 = 1850€
    // Estimation des intérêts déjà payés (basée sur les intérêts moyens actuels)
    const interetsMensuelMoyen = 30.27 + 84.33 + 0; // Intérêts moyens par mois des 3 crédits
    const interetsDejaPayes = moisEcoules * interetsMensuelMoyen;
    const montantDejaPayeTotal = assuranceDejaPayee + interetsDejaPayes;

    // Combiner toutes les échéances de tous les crédits
    const allEchances = [
      ...creditPrincipal.echances.map((e) => ({
        ...e,
        creditType: "principal",
      })),
      ...creditComplementaire.echances.map((e) => ({
        ...e,
        creditType: "complementaire",
      })),
      ...creditZero.echances.map((e) => ({ ...e, creditType: "zero" })),
    ];

    // Grouper par mois (YYYY-MM)
    const groupedByMonth = allEchances.reduce((acc, echeance) => {
      const date = new Date(echeance.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          date: echeance.date,
          echances: [],
        };
      }

      acc[monthKey].echances.push(echeance);
      return acc;
    }, {} as Record<string, { date: string; echances: any[] }>);

    // Convertir en tableau trié et calculer les cumuls
    // Initialiser avec les montants déjà payés depuis mai 2021
    let cumulCapitalRembourse = capitalDejaRembourseTotal;
    let cumulMontantPaye = montantDejaPayeTotal;

    const sortedMonths = Object.keys(groupedByMonth).sort();

    // Calculer les cumuls jusqu'au mois actuel (août 2025)
    const currentMonth = "2025-08"; // Mois actuel
    const monthsUntilCurrent = sortedMonths.filter(
      (monthKey) => monthKey < currentMonth
    );

    // Ajouter le capital et montant payé des échéances entre juillet 2024 et juillet 2025
    monthsUntilCurrent.forEach((monthKey) => {
      const monthData = groupedByMonth[monthKey];
      let capitalTotal = 0;
      let interetsTotal = 0;

      monthData.echances.forEach((echeance) => {
        capitalTotal += echeance.capital;
        interetsTotal += echeance.interets;
      });

      cumulCapitalRembourse += capitalTotal;
      cumulMontantPaye += assuranceMensuelle + interetsTotal;
    });

    // Filtrer pour commencer à partir du mois actuel (août 2025)
    const filteredMonths = sortedMonths.filter(
      (monthKey) => monthKey >= currentMonth
    );

    filteredMonths.forEach((monthKey) => {
      const monthData = groupedByMonth[monthKey];
      const date = new Date(monthData.date);

      // Calculer les totaux pour ce mois
      let mensualiteTotal = 0;
      let capitalTotal = 0;
      let interetsTotal = 0;

      monthData.echances.forEach((echeance) => {
        mensualiteTotal += echeance.montant;
        capitalTotal += echeance.capital;
        interetsTotal += echeance.interets;
      });

      // Mettre à jour les cumuls
      cumulCapitalRembourse += capitalTotal;
      cumulMontantPaye += assuranceMensuelle + interetsTotal;

      // Formater la date pour l'affichage
      const formattedDate = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      });

      // Calculer le nombre de mois écoulés depuis mai 2021 jusqu'à ce mois
      const dateMois = new Date(monthKey + "-01");
      const dateMai2021 = new Date("2021-05-01");
      const moisEcoulesDepuisMai2021 = Math.round(
        (dateMois.getTime() - dateMai2021.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44)
      );

      // Calculer la moyenne mensuelle
      const moyenneMensuelle = cumulMontantPaye / moisEcoulesDepuisMai2021;

      data.push({
        date: monthKey,
        formattedDate,
        mensualite: mensualiteTotal,
        assurance: assuranceMensuelle,
        montantRembourse: cumulCapitalRembourse,
        montantPaye: cumulMontantPaye,
        moyenneMensuelle,
      });
    });

    return data;
  }, []);

  const columns = [
    columnHelper.accessor("formattedDate", {
      header: "Mois",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("montantRembourse", {
      header: "Capital remboursé (cumulé)",
      cell: (info) => {
        const value = info.getValue();
        return (
          <span className="text-black-600 font-medium">
            {value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        );
      },
    }),
    columnHelper.accessor("montantPaye", {
      header: "Coût total (cumulé)",
      cell: (info) => {
        const value = info.getValue();
        return (
          <span className="text-black-600 font-medium">
            {value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        );
      },
    }),
    columnHelper.accessor("moyenneMensuelle", {
      header: "Moyenne mensuelle",
      cell: (info) => {
        const value = info.getValue();
        return (
          <span className="text-black-600 font-medium">
            {value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €/mois
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: monthlyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calculer les statistiques globales
  const totalStats = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const lastRow = monthlyData[monthlyData.length - 1];
    const firstRow = monthlyData[0]; // Premier mois du tableau (août 2025)
    const totalMensualites = monthlyData.reduce(
      (sum, row) => sum + row.mensualite,
      0
    );

    // Calculer le nombre total d'échéances disponibles dans les données JSON
    // En comptant toutes les échéances de tous les crédits
    const totalEcheancesPrincipal = creditPrincipal.echances.length;
    const totalEcheancesComplementaire = creditComplementaire.echances.length;
    const totalEcheancesZero = creditZero.echances.length;
    // Prendre le maximum car les échéances sont alignées par mois
    const totalEcheancesDisponibles = Math.max(
      totalEcheancesPrincipal,
      totalEcheancesComplementaire,
      totalEcheancesZero
    );

    const moisDepuisMai2021 = 37 + totalEcheancesDisponibles; // 37 mois écoulés + toutes les échéances disponibles

    // Pour le tableau (coût restant), calculer seulement les échéances futures depuis août 2025
    const totalMensualitesRestantes = totalMensualites;

    // Capital total emprunté - montant initial confirmé par l'utilisateur
    const capitalTotalEmprunt = 196299.0;

    return {
      dureeTotal: moisDepuisMai2021,
      dureeDepuisJuillet2024: monthlyData.length,
      capitalTotal: capitalTotalEmprunt,
      capitalRembourse: firstRow.montantRembourse, // Capital remboursé au mois actuel (août 2025)
      interetsEtAssuranceTotal: lastRow.montantPaye,
      mensualitesTotales: totalMensualitesRestantes,
    };
  }, [monthlyData]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Échéancier des crédits immobiliers
          </h2>
          <div className="text-xs text-muted-foreground mt-1">
            Vue consolidée de vos 3 crédits avec évolution mensuelle
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      {totalStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Capital emprunté
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats.capitalTotal.toLocaleString("fr-FR")} €
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Apport initial
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20 000 €</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Capital remboursé
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats.capitalRembourse.toLocaleString("fr-FR")} €
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (totalStats.capitalRembourse / totalStats.capitalTotal) * 100
                )}
                % du prêt
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Cards Grid */}
      {totalStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensualité</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">755,70 €</div>
              <p className="text-xs text-muted-foreground">
                dont 50€ assurance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Durée totale
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totalStats.dureeTotal / 12)} ans
              </div>
              <p className="text-xs text-muted-foreground">
                {totalStats.dureeTotal} mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats.interetsEtAssuranceTotal.toLocaleString("fr-FR")} €
              </div>
              <p className="text-xs text-muted-foreground">
                Intérêt + assurance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            💡 Historique du prêt
          </h4>
          <ul className="space-y-1 text-xs">
            <li>
              • <strong>Démarrage:</strong> Mai 2021 (196 299 €)
            </li>
            <li>
              • <strong>Données depuis:</strong> Juillet 2024
            </li>
            <li>
              • <strong>37 mois</strong> déjà écoulés avant nos données
            </li>
            <li>• Capital déjà remboursé inclus dans les cumuls</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📊 Composition</h4>
          <ul className="space-y-1 text-xs">
            <li>
              • <strong>Capital remboursé:</strong> Cumul depuis mai 2021
            </li>
            <li>
              • <strong>Montant payé:</strong> Assurance + intérêts cumulés
            </li>
            <li>
              • <strong>Crédit à 0%:</strong> Terminé en mai 2036
            </li>
            <li>
              • <strong>Assurance:</strong> 50 €/mois constante
            </li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🎯 Points clés</h4>
          <ul className="space-y-1 text-xs">
            <li>
              • Échéances futures: <strong>{monthlyData.length}</strong>
            </li>
            <li>
              • Fin complète en <strong>mai 2046</strong>
            </li>
            <li>
              • Durée totale: <strong>{totalStats?.dureeTotal} mois</strong>
            </li>
            <li>
              • Taux d'avancement:{" "}
              <strong>
                {Math.round(
                  ((totalStats?.capitalRembourse || 0) / 196299) * 100
                )}
                %
              </strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditsTable;
