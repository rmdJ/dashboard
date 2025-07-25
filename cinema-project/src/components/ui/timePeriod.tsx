import { FC } from "react";
import { Badge } from "@/components/ui/lib/badge";
import { TRAILER_DELAY_MINUTES } from "@/assets/constants";

const formatTime = (date: Date) =>
  date
    .toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", "h");

const parseRuntime = (runtime: string | null) => {
  if (!runtime) return 0;
  const [hours, minutes] = runtime.split(" ").reduce(
    (acc, time) => {
      if (time.includes("h")) acc[0] = parseInt(time);
      if (time.includes("min")) acc[1] = parseInt(time);
      return acc;
    },
    [0, 0]
  );
  return hours * 60 + minutes;
};

export const TimePeriod: FC<{
  startsAt: string;
  runtime: string | null;
}> = ({ startsAt, runtime }) => {
  const startTime = new Date(startsAt);
  const endTime = new Date(
    startTime.getTime() +
      (parseRuntime(runtime) + TRAILER_DELAY_MINUTES) * 60000
  );

  return (
    <Badge variant="outline" className="font-normal">
      {formatTime(startTime)}-{formatTime(endTime)}
    </Badge>
  );
};
