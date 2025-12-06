import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// 1. Skeleton para Tablas
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border bg-background">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-6 w-[30%]" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[10%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Skeleton para KPIs
export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[140px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 3. Skeleton para Gráficas
export function ChartSkeleton() {
  return (
    <Card className="h-[300px] flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent className="flex-1 flex items-end justify-between gap-2 pb-6 px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-md"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// 4. Skeleton para Grid de Productos (POS)
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-[200px]">
          <div className="h-28 bg-muted animate-pulse" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 5. Skeleton para Listas de Historial (Reportes)
export function HistoryListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-4 w-16 ml-auto rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
