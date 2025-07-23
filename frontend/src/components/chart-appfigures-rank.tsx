"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, ReferenceLine } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSignalData } from "@/hooks/useSignal";
import { signalObjectives } from "@/assets/constants/crypto";

const chartConfig = {
  rank: {
    label: "AppFigures Finance Rank",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAppFiguresRank() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("all");
  const { data: signalData } = useSignalData();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("90d");
    }
  }, [isMobile]);

  // Transformer les données Signal en format pour le graphique
  const chartData = React.useMemo(() => {
    if (!signalData || signalData.length === 0) return [];

    // Créer un map des données existantes avec AppFigures Finance Rank
    const dataMap = new Map<string, number>();
    
    signalData.forEach((entry) => {
      const appFiguresItem = entry.data?.find(
        (item) => item.source === "AppFigures Finance Rank"
      );
      if (appFiguresItem) {
        dataMap.set(entry.date, appFiguresItem.value);
      }
    });

    // Créer une liste complète de toutes les dates disponibles
    const allDates = signalData
      .map(entry => entry.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const processedData: Array<{ date: string; rank: number }> = [];
    let lastValidRank: number | null = null;

    // Parcourir toutes les dates et combler les trous
    for (const date of allDates) {
      if (dataMap.has(date)) {
        // Données disponibles, utiliser la vraie valeur
        lastValidRank = dataMap.get(date)!;
        processedData.push({
          date,
          rank: lastValidRank,
        });
      } else if (lastValidRank !== null) {
        // Données manquantes, utiliser la dernière valeur valide
        processedData.push({
          date,
          rank: lastValidRank,
        });
      }
      // Si pas de donnée et pas de valeur précédente, ignorer cette entrée
    }

    return processedData;
  }, [signalData]);

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    // Si "All" est sélectionné, retourner toutes les données
    if (timeRange === "all") {
      return chartData;
    }

    const now = new Date();
    let daysToSubtract = 90;

    if (timeRange === "365d") {
      daysToSubtract = 365;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [chartData, timeRange]);

  // Récupérer l'objectif depuis les constantes
  const objective =
    signalObjectives.find((obj) => obj.name === "AppFigures Finance Rank")
      ?.value || 4;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>AppFigures Finance Rank</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            App store ranking evolution with objective at #{objective}
          </span>
          <span className="@[540px]/card:hidden">Ranking evolution</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="365d">Last year</ToggleGroupItem>
            <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All
              </SelectItem>
              <SelectItem value="365d" className="rounded-lg">
                Last year
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillRank" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-rank)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-rank)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => [
                      `#${Math.round(value as number)}`,
                      "Rank",
                    ]}
                    indicator="dot"
                  />
                }
              />
              {/* Ligne horizontale pour l'objectif */}
              <ReferenceLine
                y={objective}
                stroke="var(--color-rank)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Objective: #${objective}`,
                  position: "top",
                }}
              />
              <Area
                dataKey="rank"
                type="natural"
                fill="url(#fillRank)"
                stroke="var(--color-rank)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
