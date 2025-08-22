"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { useEvolution } from "@/hooks/useEvolution";

const chartConfig = {
  roadTo10k: {
    label: "Road to 10k",
    color: "#8884d8",
  },
  roadTo1btc: {
    label: "Road to 1 BTC",
    color: "#82ca9d",
  },
} satisfies ChartConfig;

interface ChartDataPoint {
  date: string;
  roadTo10k: number;
  roadTo1btc: number;
}

export function ChartEvolution() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("all");
  const { data: evolutionData, isLoading, error } = useEvolution();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("90d");
    }
  }, [isMobile]);

  // Combiner les données des deux collections par date
  const chartData = React.useMemo(() => {
    if (!evolutionData) return [];

    const dateMap = new Map<string, ChartDataPoint>();

    // Ajouter les données road-to-10k
    evolutionData.roadTo10k.forEach((point: any) => {
      const dateKey = new Date(point.date).toISOString().split("T")[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          roadTo10k: 0,
          roadTo1btc: 0,
        });
      }
      dateMap.get(dateKey)!.roadTo10k = point.data?.currentValue || 0;
    });

    // Ajouter les données road-to-1btc
    evolutionData.roadTo1btc.forEach((point: any) => {
      const dateKey = new Date(point.date).toISOString().split("T")[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          roadTo10k: 0,
          roadTo1btc: 0,
        });
      }
      dateMap.get(dateKey)!.roadTo1btc = point.data?.btcValue || 0;
    });

    // Convertir en array et trier par date
    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [evolutionData]);

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

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Evolution Road to 10k & 1 BTC</CardTitle>
          <CardDescription>Portfolio evolution tracking</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Loading evolution data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !evolutionData) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Evolution Road to 10k & 1 BTC</CardTitle>
          <CardDescription>Portfolio evolution tracking</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Erreur lors du chargement des données d'évolution
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Evolution BTC Vs Portfolio</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Portfolio evolution with dual-axis tracking ($USD / ₿BTC)
          </span>
          <span className="@[540px]/card:hidden">Portfolio evolution</span>
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
                <linearGradient id="fillRoadTo10k" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-roadTo10k)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-roadTo10k)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRoadTo1btc" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-roadTo1btc)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-roadTo1btc)"
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
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₿${(value / 1000).toFixed(0)}k`}
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
                    formatter={(value, name) => {
                      if (name === "roadTo1btc") {
                        return [
                          `₿${Math.round(value as number).toLocaleString()}`,
                          "Road to 1 BTC",
                        ];
                      }
                      return [
                        `$${Math.round(value as number).toLocaleString()}`,
                        "Road to 10k",
                      ];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                yAxisId="left"
                dataKey="roadTo10k"
                type="natural"
                fill="url(#fillRoadTo10k)"
                stroke="var(--color-roadTo10k)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                dataKey="roadTo1btc"
                type="natural"
                fill="url(#fillRoadTo1btc)"
                stroke="var(--color-roadTo1btc)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
