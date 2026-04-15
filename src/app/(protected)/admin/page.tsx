import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Layers3,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getUser } from "@/lib/cache/userCache";
import { getAdminDashboardData } from "@/lib/services/admin-dashboard.service";
import { findAdminStores } from "@/lib/repositories/store.repo";
import { formatIDR } from "@/lib/utils/currency";

type AdminDashboardPageProps = {
  searchParams:
    | Promise<{
        salesFrom?: string;
        salesTo?: string;
        ordersRange?: string;
        storeId?: string;
      }>
    | {
        salesFrom?: string;
        salesTo?: string;
        ordersRange?: string;
        storeId?: string;
      };
};

type OrderRangeOption = "1w" | "2w" | "1m" | "3m" | "6m" | "1y";
type OrdersBucket = "day" | "week" | "month";

type SalesPoint = {
  label: string;
  shortLabel: string;
  value: number;
};

type OrdersPoint = {
  label: string;
  shortLabel: string;
  value: number;
};

const ORDER_RANGE_OPTIONS: Array<{
  value: OrderRangeOption;
  label: string;
}> = [
  { value: "1w", label: "1 Week" },
  { value: "2w", label: "2 Weeks" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

const dayLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});
const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "2-digit",
});
const rangeLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const compactNumberFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const wholeNumberFormatter = new Intl.NumberFormat("id-ID");

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function addMonths(value: Date, months: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date;
}

function differenceInDays(start: Date, end: Date) {
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000
  );
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string | undefined, fallback: Date, isEnd = false) {
  if (!value) {
    return isEnd ? endOfDay(fallback) : startOfDay(fallback);
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isEnd ? endOfDay(fallback) : startOfDay(fallback);
  }

  return isEnd ? endOfDay(parsed) : startOfDay(parsed);
}

function getDefaultSalesRange() {
  const today = new Date();
  return {
    from: startOfDay(addDays(today, -29)),
    to: endOfDay(today),
  };
}

function getOverviewRange() {
  const today = new Date();
  return {
    from: startOfDay(addDays(today, -29)),
    to: endOfDay(today),
  };
}

function getOrdersWindow(range: OrderRangeOption) {
  const today = new Date();

  switch (range) {
    case "1w":
      return {
        from: startOfDay(addDays(today, -6)),
        to: endOfDay(today),
        bucket: "day" as OrdersBucket,
        averageLabel: "avg / day",
      };
    case "2w":
      return {
        from: startOfDay(addDays(today, -13)),
        to: endOfDay(today),
        bucket: "day" as OrdersBucket,
        averageLabel: "avg / day",
      };
    case "1m":
      return {
        from: startOfDay(addDays(today, -29)),
        to: endOfDay(today),
        bucket: "day" as OrdersBucket,
        averageLabel: "avg / day",
      };
    case "3m":
      return {
        from: startOfDay(addMonths(today, -3)),
        to: endOfDay(today),
        bucket: "week" as OrdersBucket,
        averageLabel: "avg / week",
      };
    case "6m":
      return {
        from: startOfDay(addMonths(today, -6)),
        to: endOfDay(today),
        bucket: "week" as OrdersBucket,
        averageLabel: "avg / week",
      };
    case "1y":
      return {
        from: startOfDay(addMonths(today, -11)),
        to: endOfDay(today),
        bucket: "month" as OrdersBucket,
        averageLabel: "avg / month",
      };
    default:
      return {
        from: startOfDay(addDays(today, -29)),
        to: endOfDay(today),
        bucket: "day" as OrdersBucket,
        averageLabel: "avg / day",
      };
  }
}

function buildDashboardHref(
  salesFrom: string,
  salesTo: string,
  ordersRange: OrderRangeOption,
  storeId: string
) {
  const params = new URLSearchParams();
  params.set("salesFrom", salesFrom);
  params.set("salesTo", salesTo);
  params.set("ordersRange", ordersRange);
  if (storeId) {
    params.set("storeId", storeId);
  }
  return `/admin?${params.toString()}`;
}

function toDateKey(value: Date) {
  return formatDateInput(value);
}

function parseSeriesDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function buildDailyRevenueSeries(
  rows: Array<{ day: string; revenue: string }>,
  from: Date,
  to: Date
): SalesPoint[] {
  const map = new Map(rows.map((row) => [row.day, Number(row.revenue ?? 0)]));
  const points: SalesPoint[] = [];

  for (let cursor = startOfDay(from); cursor <= startOfDay(to); cursor = addDays(cursor, 1)) {
    const key = toDateKey(cursor);
    points.push({
      label: rangeLabelFormatter.format(cursor),
      shortLabel: dayLabelFormatter.format(cursor),
      value: map.get(key) ?? 0,
    });
  }

  return points;
}

function getStartOfWeek(value: Date) {
  const date = startOfDay(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function buildOrdersSeries(
  rows: Array<{ day: string; count: number }>,
  from: Date,
  to: Date,
  bucket: OrdersBucket
): OrdersPoint[] {
  const dailyMap = new Map(rows.map((row) => [row.day, Number(row.count ?? 0)]));

  if (bucket === "day") {
    const points: OrdersPoint[] = [];
    for (let cursor = startOfDay(from); cursor <= startOfDay(to); cursor = addDays(cursor, 1)) {
      const key = toDateKey(cursor);
      points.push({
        label: rangeLabelFormatter.format(cursor),
        shortLabel: dayLabelFormatter.format(cursor),
        value: dailyMap.get(key) ?? 0,
      });
    }
    return points;
  }

  if (bucket === "week") {
    const grouped = new Map<string, OrdersPoint>();
    for (let cursor = startOfDay(from); cursor <= startOfDay(to); cursor = addDays(cursor, 1)) {
      const weekStart = getStartOfWeek(cursor);
      const weekEnd = addDays(weekStart, 6);
      const key = toDateKey(weekStart);
      const existing = grouped.get(key);
      const nextValue = (existing?.value ?? 0) + (dailyMap.get(toDateKey(cursor)) ?? 0);

      grouped.set(key, {
        label: `${rangeLabelFormatter.format(weekStart)} - ${rangeLabelFormatter.format(weekEnd)}`,
        shortLabel: `${dayLabelFormatter.format(weekStart)} - ${dayLabelFormatter.format(weekEnd)}`,
        value: nextValue,
      });
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, point]) => point);
  }

  const grouped = new Map<string, OrdersPoint>();
  for (let cursor = startOfDay(from); cursor <= startOfDay(to); cursor = addDays(cursor, 1)) {
    const date = parseSeriesDate(toDateKey(cursor));
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
    const existing = grouped.get(key);
    const nextValue = (existing?.value ?? 0) + (dailyMap.get(toDateKey(cursor)) ?? 0);

    grouped.set(key, {
      label: monthLabelFormatter.format(date),
      shortLabel: monthLabelFormatter.format(date),
      value: nextValue,
    });
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, point]) => point);
}

function getBarHeights(values: number[], chartHeight: number) {
  const max = Math.max(...values, 1);
  const paddedMax = max * 1.2;

  return values.map((value) => {
    if (value <= 0) return 6;
    return Math.max(18, (value / paddedMax) * chartHeight);
  });
}

function StatCard({
  title,
  value,
  hint,
  icon,
  accentClassName,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accentClassName: string;
}) {
  return (
    <Card className="border-border/60 bg-gradient-to-br from-background to-muted/25 py-0">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentClassName}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function SalesChart({
  points,
}: {
  points: SalesPoint[];
}) {
  const values = points.map((point) => point.value);
  const heights = getBarHeights(values, 176);
  const peak = Math.max(...values, 0);
  const midpoint = points[Math.floor(points.length / 2)];
  const yTicks = [0, 0.5, 1].map((ratio) => ({
    ratio,
    value: peak * ratio,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-to-b from-emerald-500/5 via-background to-background p-4">
        <div className="mb-4 flex min-h-4 items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Y-axis: Revenue (IDR)</span>
          <span>X-axis: Date</span>
        </div>

        {points.every((point) => point.value === 0) ? (
          <div className="flex h-[308px] w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No sales data in this date range.
          </div>
        ) : (
          <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
            <div className="flex h-[308px] flex-col justify-between border-r border-border/40 pb-12 pr-3 text-[11px] text-muted-foreground">
              {yTicks
                .slice()
                .reverse()
                .map((tick) => (
                  <span key={tick.ratio}>{formatIDR(tick.value)}</span>
                ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="relative h-[272px] border-b border-border/40">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-0">
                  {[0, 1, 2].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-border/30"
                    />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-2">
                  {points.map((point, index) => (
                    <div
                      key={`${point.label}-${index}`}
                      className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      title={`${point.label}: ${formatIDR(point.value)}`}
                    >
                      <div className="text-[11px] font-medium text-muted-foreground">
                        {point.value > 0 ? compactNumberFormatter.format(point.value) : ""}
                      </div>
                      <div
                        className={`w-full rounded-t-xl transition-all ${
                          point.value > 0
                            ? "bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-300"
                            : "bg-muted/50"
                        }`}
                        style={{ height: `${heights[index] ?? 6}px` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid h-6 grid-cols-3 items-center text-center text-xs text-muted-foreground">
                <span>{points[0]?.shortLabel ?? "-"}</span>
                <span>{midpoint?.shortLabel ?? "-"}</span>
                <span className="text-right">{points.at(-1)?.shortLabel ?? "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 items-center text-xs text-muted-foreground">
        <span>Revenue per period</span>
        <span className="text-center">Peak {formatIDR(peak)}</span>
        <span className="text-right">{wholeNumberFormatter.format(points.length)} data points</span>
      </div>
    </div>
  );
}

function OrdersChart({
  points,
}: {
  points: OrdersPoint[];
}) {
  const values = points.map((point) => point.value);
  const heights = getBarHeights(values, 180);
  const max = Math.max(...values, 0);
  const yTicks = [0, 0.5, 1].map((ratio) => ({
    ratio,
    value: Math.round(max * ratio),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-to-b from-sky-500/5 via-background to-background p-4">
        <div className="mb-4 flex min-h-4 items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Y-axis: Number of orders</span>
          <span>X-axis: Date range</span>
        </div>

        {points.every((point) => point.value === 0) ? (
          <div className="flex h-[308px] w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No order activity in this range.
          </div>
        ) : (
          <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
            <div className="flex h-[308px] flex-col justify-between border-r border-border/40 pb-12 pr-3 text-[11px] text-muted-foreground">
              {yTicks
                .slice()
                .reverse()
                .map((tick) => (
                  <span key={tick.ratio}>{wholeNumberFormatter.format(tick.value)}</span>
                ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="relative h-[272px] border-b border-border/40">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-0">
                  {[0, 1, 2].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-border/30"
                    />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-2">
                  {points.map((point, index) => (
                    <div key={`${point.label}-${index}`} className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <div className="text-[11px] font-medium text-muted-foreground">
                        {point.value}
                      </div>
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-sky-600 to-cyan-400"
                        style={{ height: `${Math.max(10, heights[index] ?? 0)}px` }}
                        title={`${point.label}: ${point.value} orders`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid h-6 grid-cols-3 items-center text-center text-xs text-muted-foreground">
                <span>{points[0]?.shortLabel ?? "-"}</span>
                <span>{points[Math.floor(points.length / 2)]?.shortLabel ?? "-"}</span>
                <span className="text-right">{points.at(-1)?.shortLabel ?? "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 items-center text-xs text-muted-foreground">
        <span>Orders per period</span>
        <span className="text-center">Peak {wholeNumberFormatter.format(max)} orders</span>
        <span className="text-right">{wholeNumberFormatter.format(points.length)} data points</span>
      </div>
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: AdminDashboardPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getUser(clerkUser.id);
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const defaultSalesRange = getDefaultSalesRange();
  const overviewRange = getOverviewRange();
  const adminStores = await findAdminStores(clerkUser.id);
  const ordersRange = (params?.ordersRange as OrderRangeOption) || "1m";
  const validOrdersRange = ORDER_RANGE_OPTIONS.some((option) => option.value === ordersRange)
    ? ordersRange
    : "1m";
  const selectedStoreId = params?.storeId ?? "";
  const selectedStore =
    adminStores.find((store) => store.id === selectedStoreId) ?? null;

  const salesFromValue =
    params?.salesFrom ?? formatDateInput(defaultSalesRange.from);
  const salesToValue =
    params?.salesTo ?? formatDateInput(defaultSalesRange.to);

  let salesFrom = parseDateInput(
    params?.salesFrom,
    defaultSalesRange.from
  );
  let salesTo = parseDateInput(
    params?.salesTo,
    defaultSalesRange.to,
    true
  );

  if (salesFrom.getTime() > salesTo.getTime()) {
    salesFrom = defaultSalesRange.from;
    salesTo = defaultSalesRange.to;
  }

  const ordersWindow = getOrdersWindow(validOrdersRange);
  const dashboard = await getAdminDashboardData({
    adminId: clerkUser.id,
    storeId: selectedStore?.id,
    salesFrom,
    salesTo,
    ordersFrom: ordersWindow.from,
    ordersTo: ordersWindow.to,
    overviewFrom: overviewRange.from,
    overviewTo: overviewRange.to,
  });

  const salesPoints = buildDailyRevenueSeries(
    dashboard.salesSeries,
    salesFrom,
    salesTo
  );
  const ordersPoints = buildOrdersSeries(
    dashboard.orderSeries,
    ordersWindow.from,
    ordersWindow.to,
    ordersWindow.bucket
  );

  const totalSalesInRange = salesPoints.reduce((sum, point) => sum + point.value, 0);
  const totalOrdersInRange = ordersPoints.reduce((sum, point) => sum + point.value, 0);
  const averageOrders =
    ordersPoints.length > 0 ? totalOrdersInRange / ordersPoints.length : 0;
  const activeSalesDays = salesPoints.filter((point) => point.value > 0).length;
  const salesRangeLength = differenceInDays(salesFrom, salesTo) + 1;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-[0.18em] uppercase">
              Admin Analytics
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Dashboard Performance Toko
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Pantau penjualan, order masuk, customer aktif, revenue, dan profit
                dari satu tempat. Semua ringkasan di bawah ini sudah terhubung ke
                data transaksi toko admin.
              </p>
              <p className="text-sm text-muted-foreground">
                Shop scope:{" "}
                <span className="font-medium text-foreground">
                  {selectedStore?.name ?? "All shops"}
                </span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Revenue 30 Hari
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatIDR(dashboard.overview.totalRevenueLast30Days)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Profit 30 Hari
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatIDR(dashboard.overview.totalProfitLast30Days)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <CardTitle>Dashboard Controls</CardTitle>
          <CardDescription>
            Atur rentang chart penjualan dan pilih horizon order yang ingin dipantau.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_auto] xl:items-end">
            <input type="hidden" name="ordersRange" value={validOrdersRange} />
            <div className="space-y-2 rounded-2xl border bg-muted/20 p-4 xl:col-span-3">
              <label htmlFor="storeId" className="text-sm font-medium">
                Shop switcher
              </label>
              <select
                id="storeId"
                name="storeId"
                defaultValue={selectedStoreId}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              >
                <option value="">All shops</option>
                {adminStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
              <label htmlFor="salesFrom" className="text-sm font-medium">
                Sales chart from
              </label>
              <Input id="salesFrom" name="salesFrom" type="date" defaultValue={salesFromValue} />
            </div>
            <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
              <label htmlFor="salesTo" className="text-sm font-medium">
                Sales chart to
              </label>
              <Input id="salesTo" name="salesTo" type="date" defaultValue={salesToValue} />
            </div>
            <div className="flex flex-col gap-2 xl:min-w-[180px] xl:pb-1">
              <Button type="submit" className="w-full">
                Apply Range
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">Reset</Link>
              </Button>
            </div>
          </form>

          <div className="space-y-3 rounded-2xl border bg-muted/15 p-4">
            <p className="text-sm font-medium">Order trend range</p>
            <div className="flex flex-wrap gap-2">
              {ORDER_RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  asChild
                  variant={option.value === validOrdersRange ? "default" : "outline"}
                  size="sm"
                >
                  <Link
                    href={buildDashboardHref(
                      salesFromValue,
                      salesToValue,
                      option.value,
                      selectedStoreId
                    )}
                  >
                    {option.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Customers who bought"
          value={wholeNumberFormatter.format(dashboard.overview.totalCustomers)}
          hint="Distinct buyers across your stores"
          icon={<Users className="h-5 w-5 text-sky-600" />}
          accentClassName="bg-sky-500/10"
        />
        <StatCard
          title="Total products"
          value={wholeNumberFormatter.format(dashboard.overview.totalProducts)}
          hint="Active catalog footprint across stores"
          icon={<Boxes className="h-5 w-5 text-violet-600" />}
          accentClassName="bg-violet-500/10"
        />
        <StatCard
          title="Total categories"
          value={wholeNumberFormatter.format(dashboard.overview.totalCategories)}
          hint="Category structure available for products"
          icon={<Layers3 className="h-5 w-5 text-amber-600" />}
          accentClassName="bg-amber-500/10"
        />
        <StatCard
          title="Orders last 30 days"
          value={wholeNumberFormatter.format(dashboard.overview.totalOrdersLast30Days)}
          hint="All orders created in the last 30 days"
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          accentClassName="bg-primary/10"
        />
        <StatCard
          title="Revenue last 30 days"
          value={formatIDR(dashboard.overview.totalRevenueLast30Days)}
          hint="Completed transaction revenue only"
          icon={<CircleDollarSign className="h-5 w-5 text-cyan-600" />}
          accentClassName="bg-cyan-500/10"
        />
        <StatCard
          title="Profit last 30 days"
          value={formatIDR(dashboard.overview.totalProfitLast30Days)}
          hint="Using item price minus production cost"
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          accentClassName="bg-emerald-500/10"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-border/60 py-0">
          <CardHeader className="border-b pt-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>
                  Menampilkan revenue harian untuk periode{" "}
                  {dayLabelFormatter.format(salesFrom)} sampai{" "}
                  {rangeLabelFormatter.format(salesTo)}.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {wholeNumberFormatter.format(activeSalesDays)} active selling days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Total sales
                </p>
                <p className="mt-2 text-xl font-bold">
                  {formatIDR(totalSalesInRange)}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Average per day
                </p>
                <p className="mt-2 text-xl font-bold">
                  {formatIDR(salesRangeLength > 0 ? totalSalesInRange / salesRangeLength : 0)}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Peak day
                </p>
                <p className="mt-2 text-xl font-bold">
                  {formatIDR(Math.max(...salesPoints.map((point) => point.value), 0))}
                </p>
              </div>
            </div>

            <SalesChart points={salesPoints} />
          </CardContent>
        </Card>

        <Card className="border-border/60 py-0">
          <CardHeader className="border-b pt-7">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ChartNoAxesCombined className="h-5 w-5 text-sky-600" />
                <CardTitle>Order Flow</CardTitle>
              </div>
              <CardDescription>
                Incoming orders for the selected horizon with flexible bucket sizing.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Total orders
                </p>
                <p className="mt-2 text-xl font-bold">
                  {wholeNumberFormatter.format(totalOrdersInRange)}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {ordersWindow.averageLabel}
                </p>
                <p className="mt-2 text-xl font-bold">
                  {compactNumberFormatter.format(averageOrders)}
                </p>
              </div>
            </div>

            <OrdersChart points={ordersPoints} />
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Quick Action</CardTitle>
              <CardDescription>
                Buka ledger transaksi lengkap untuk analisa lebih detail per order.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={selectedStoreId ? `/admin/transactions?storeId=${selectedStoreId}` : "/admin/transactions"}>
                Open Transactions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-muted/25 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Flexible sales review</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ubah rentang tanggal chart penjualan untuk membandingkan performa
              beberapa bulan ke belakang.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/25 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10">
              <ChartNoAxesCombined className="h-5 w-5 text-sky-600" />
            </div>
            <h3 className="font-semibold">Order trend monitoring</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cek lonjakan order mingguan, bulanan, sampai tahunan dari range yang
              paling relevan untuk operasional.
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/25 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Revenue to profit snapshot</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Lihat sekilas hubungan revenue dan profit 30 hari terakhir sebelum
              masuk ke rincian transaksi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
