import { CinemaNextReleases } from "@/app/dashboard/cinemaNextReleases";
import { CryptoOverview } from "@/app/dashboard/cryptoOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

// Import loan data to calculate capital remboursé
import creditPrincipal from "@/data/loan/main.json";
import creditComplementaire from "@/data/loan/other_main.json";
import creditZero from "@/data/loan/zero_percent.json";

export const Dashboard = () => {
  // Calculer le capital remboursé depuis mai 2021 (même logique que dans loan/index.tsx)
  const capitalRembourse = (() => {
    // Montants restants en juillet 2024 (première échéance disponible)
    const restantJuillet2024Principal = 55428.52;
    const restantJuillet2024Complementaire = 96347.09;
    const restantJuillet2024Zero = 15383.46;

    const totalRestantJuillet2024 =
      restantJuillet2024Principal +
      restantJuillet2024Complementaire +
      restantJuillet2024Zero;
    const capitalDejaRembourseTotal = 196299 - totalRestantJuillet2024;

    // Grouper les échéances par mois pour calculer le capital remboursé jusqu'à août 2025
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

    const groupedByMonth = allEchances.reduce((acc, echeance) => {
      const date = new Date(echeance.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { date: echeance.date, echances: [] };
      }
      acc[monthKey].echances.push(echeance);
      return acc;
    }, {} as Record<string, { date: string; echances: any[] }>);

    const sortedMonths = Object.keys(groupedByMonth).sort();
    const currentMonth = "2025-08";
    const monthsUntilCurrent = sortedMonths.filter(
      (monthKey) => monthKey <= currentMonth
    );

    let cumulCapitalRembourse = capitalDejaRembourseTotal;

    // Ajouter le capital des échéances entre juillet 2024 et août 2025 (inclus)
    monthsUntilCurrent.forEach((monthKey) => {
      const monthData = groupedByMonth[monthKey];
      let capitalTotal = 0;

      monthData.echances.forEach((echeance) => {
        capitalTotal += echeance.capital;
      });

      cumulCapitalRembourse += capitalTotal;
    });

    return cumulCapitalRembourse;
  })();

  const capitalTotal = 196299;

  return (
    <div className="flex-1  space-y-6 p-4 md:p-8 md:pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Crypto</h2>
          <CryptoOverview />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Prêt</h2>
          <div className="w-full md:w-1/2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Capital remboursé
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="text-2xl font-bold">
                  {capitalRembourse.toLocaleString("fr-FR")} €
                </div>
                <p className="text-xs text-muted-foreground">
                  {((capitalRembourse / capitalTotal) * 100).toFixed(2)}% du
                  prêt
                </p>
                <Progress
                  value={(capitalRembourse / capitalTotal) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Prochaines sorties cinéma
          </h2>
          <CinemaNextReleases />
        </div>
      </div>
    </div>
  );
};
