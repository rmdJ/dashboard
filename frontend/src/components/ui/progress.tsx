import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  const isSuccess = (value || 0) >= 90;
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value || 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-1000 ease-out",
          isSuccess ? "bg-green-500" : "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - animatedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
