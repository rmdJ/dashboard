import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  progress?: {
    value: number;
    target: string;
    label: string;
  };
  warningMessage?: string;
  historicalValue?: {
    label: string;
    value: string;
  };
  subtitle?: string;
}

export const MetricCard = ({
  title,
  icon: Icon,
  value,
  progress,
  warningMessage,
  historicalValue,
  subtitle,
}: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-2xl font-bold">
          <div className="flex items-baseline gap-2">
            <span>{value}</span>
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}

        {progress && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.target}</span>
              <span>{Math.round(progress.value)}%</span>
            </div>
            <Progress value={progress.value} className="h-2" />
            {warningMessage && (
              <div className="text-xs text-red-600 mt-1">{warningMessage}</div>
            )}
          </>
        )}

        {historicalValue && (
          <p className="text-xs text-muted-foreground">
            {historicalValue.label}:{" "}
            <span className="font-mono">{historicalValue.value}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};