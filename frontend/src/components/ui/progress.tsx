import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  isLoading = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { isLoading?: boolean }) {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const isSuccess = (value || 0) >= 90;
  
  React.useEffect(() => {
    if (!isLoading && !hasAnimated && value !== undefined) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        // Animation progressive avec requestAnimationFrame pour plus de fluidité
        const startTime = Date.now();
        const duration = 1500; // 1.5 secondes
        const targetValue = value || 0;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Fonction d'easing ease-out pour une animation plus naturelle
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentValue = easeOut * targetValue;
          
          setAnimatedValue(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (!isLoading && hasAnimated) {
      // Si les données changent après la première animation, pas d'animation
      setAnimatedValue(value || 0);
    }
  }, [value, isLoading, hasAnimated]);
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-2 w-full", className)}>
        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
        <div className="h-1 w-1 bg-primary rounded-full animate-bounce"></div>
      </div>
    );
  }
  
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
          "h-full w-full flex-1 transition-none",
          isSuccess ? "bg-green-500" : "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - animatedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
