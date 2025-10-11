// src/components/dashboard/ChartSkeleton.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartSkeleton = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full flex items-end gap-4">
          <Skeleton className="h-[20%] w-full" />
          <Skeleton className="h-[45%] w-full" />
          <Skeleton className="h-[60%] w-full" />
          <Skeleton className="h-[30%] w-full" />
          <Skeleton className="h-[75%] w-full" />
          <Skeleton className="h-[50%] w-full" />
          <Skeleton className="h-[90%] w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
