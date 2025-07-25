import { Card, CardContent, CardHeader, CardFooter } from "./lib/card";
import { Skeleton } from "./lib/skeleton";
import { Button } from "./lib/button";
import { Separator } from "./separator";

export const SkeletonCinemaCard = () => {
  return (
    <Card className="flex flex-col h-full w-[260px] md:w-full">
      <CardHeader className="p-0 relative">
        <Skeleton className="h-[250px] md:h-[350px] object-cover" />
      </CardHeader>
      <CardContent className="p-5 py-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <Separator />
      <CardContent className="p-4 pb-2">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full" disabled>
          Chargement...
        </Button>
      </CardFooter>
    </Card>
  );
};
