import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 py-0">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-[32rem] max-w-full" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-background/80 px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Fetching dashboard analytics</p>
              <p className="text-xs text-muted-foreground">
                Loading charts, order trends, revenue, and profit summary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="py-0">
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="py-0">
            <CardHeader className="border-b">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <div key={itemIndex} className="rounded-2xl border p-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-7 w-32" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
