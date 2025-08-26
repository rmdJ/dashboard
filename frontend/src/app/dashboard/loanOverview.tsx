import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import creditPrincipal from "@/data/loan/main.json";
import creditComplementaire from "@/data/loan/other_main.json";
import creditZero from "@/data/loan/zero_percent.json";
import {
  capitalTotal,
  capitalDejaRembourseTotal,
  currentMonth,
} from "@/assets/constants/loan";

export const LoanOverview = () => {
  const capitalRembourse = (() => {
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Capital prêt remboursé
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-2xl font-bold">
          {capitalRembourse.toLocaleString("fr-FR")} €
        </div>
        <p className="text-xs text-muted-foreground">
          {((capitalRembourse / capitalTotal) * 100).toFixed(2)}% du prêt
        </p>
        <Progress
          value={(capitalRembourse / capitalTotal) * 100}
          className="h-2"
        />
      </CardContent>
    </Card>
  );
};

export default LoanOverview;
