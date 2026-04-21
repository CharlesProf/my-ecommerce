import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  CircleDollarSign,
  CreditCard,
  Eye,
  Package2,
  Search,
  TrendingUp,
} from "lucide-react";

import { getUser } from "@/lib/cache/userCache";
import { getAdminTransactionDashboard } from "@/lib/services/transaction.service";
import { findAdminStores } from "@/lib/repositories/store.repo";
import { formatIDR, formatWIB } from "@/lib/utils/currency";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 15;

type TransactionsPageProps = {
  searchParams:
    | Promise<{ page?: string; from?: string; to?: string; search?: string; storeId?: string }>
    | { page?: string; from?: string; to?: string; search?: string; storeId?: string };
};

const numberFormatter = new Intl.NumberFormat("id-ID");
const dateRangeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from,
    to,
  };
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string | undefined, fallback: Date, endOfDay = false) {
  if (!value) {
    return buildDateBoundary(fallback, endOfDay);
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return buildDateBoundary(fallback, endOfDay);
  }

  return buildDateBoundary(parsed, endOfDay);
}

function buildDateBoundary(value: Date, endOfDay: boolean) {
  const date = new Date(value);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function buildPageHref(from: string, to: string, search: string, storeId: string, page: number) {
  const params = new URLSearchParams();
  params.set("from", from);
  params.set("to", to);
  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (storeId) {
    params.set("storeId", storeId);
  }
  params.set("page", String(page));
  return `/admin/transactions?${params.toString()}`;
}

function getStatusVariant(status: string) {
  if (status === "completed") return "default";
  if (status === "pending") return "secondary";
  return "destructive";
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default async function AdminTransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getUser(clerkUser.id);
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const adminStores = await findAdminStores(clerkUser.id);
  const defaultRange = getDefaultDateRange();

  const fromValue = params?.from ?? formatDateInput(defaultRange.from);
  const toValue = params?.to ?? formatDateInput(defaultRange.to);
  const searchValue = params?.search?.trim() ?? "";
  const selectedStoreId = params?.storeId ?? "";
  const selectedStore =
    adminStores.find((store) => store.id === selectedStoreId) ?? null;
  const requestedPage = Number(params?.page ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  let fromDate = parseDateInput(fromValue, defaultRange.from);
  let toDate = parseDateInput(toValue, defaultRange.to, true);

  if (fromDate.getTime() > toDate.getTime()) {
    fromDate = buildDateBoundary(defaultRange.from, false);
    toDate = buildDateBoundary(defaultRange.to, true);
  }

  const dashboard = await getAdminTransactionDashboard({
    adminId: clerkUser.id,
    storeId: selectedStore?.id,
    page,
    pageSize: PAGE_SIZE,
    from: fromDate,
    to: toDate,
    search: searchValue,
  });

  const safePage =
    dashboard.pagination.totalPages > 0
      ? Math.min(page, dashboard.pagination.totalPages)
      : 1;

  if (page !== safePage) {
    redirect(buildPageHref(fromValue, toValue, searchValue, selectedStoreId, safePage));
  }

  const periodLabel = `${dateRangeFormatter.format(fromDate)} - ${dateRangeFormatter.format(
    toDate
  )}`;
  const visiblePages = getVisiblePages(safePage, dashboard.pagination.totalPages);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/12 via-background to-sky-500/8 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-[0.2em] uppercase">
              Admin Finance Desk
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Transactions Overview</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Monitor every order, review realized profit, and keep the team aligned on
                transaction performance for the selected reporting window.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-md border-border/60 bg-background/80 py-0 backdrop-blur">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <CalendarRange className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Active Range
                </p>
                <p className="text-base font-semibold">{periodLabel}</p>
                <p className="text-xs text-muted-foreground">
                  Defaults to this month when no date is selected.
                </p>
                <p className="text-xs text-muted-foreground">
                  Shop scope:{" "}
                  <span className="font-medium text-foreground">
                    {selectedStore?.name ?? "All shops"}
                  </span>
                </p>
                {searchValue ? (
                  <p className="text-xs text-muted-foreground">
                    Customer filter:{" "}
                    <span className="font-medium text-foreground">{searchValue}</span>
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <CardTitle>Filter Report</CardTitle>
          <CardDescription>
            Select a date range and search by customer name or phone number.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto_auto] xl:items-end">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
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
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <label htmlFor="search" className="text-sm font-medium">
                Customer lookup
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  name="search"
                  defaultValue={searchValue}
                  placeholder="Search customer name or phone number"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="from" className="text-sm font-medium">
                From date
              </label>
              <Input id="from" name="from" type="date" defaultValue={fromValue} />
            </div>
            <div className="space-y-2">
              <label htmlFor="to" className="text-sm font-medium">
                To date
              </label>
              <Input id="to" name="to" type="date" defaultValue={toValue} />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Apply Filter
            </Button>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <Link href="/admin/transactions">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 bg-gradient-to-br from-background to-muted/30 py-0">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Transactions in range</p>
              <p className="text-3xl font-bold">
                {numberFormatter.format(dashboard.summary.totalTransactions)}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-background to-muted/30 py-0">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed transactions</p>
              <p className="text-3xl font-bold">
                {numberFormatter.format(dashboard.summary.completedTransactions)}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600">
              <Package2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-background to-muted/30 py-0">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed revenue</p>
              <p className="text-2xl font-bold">{formatIDR(dashboard.summary.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-background py-0">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Realized profit</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatIDR(dashboard.summary.totalProfit)}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on completed transactions in the selected period.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Transaction Ledger</CardTitle>
              <CardDescription>
                Showing page {safePage} of {dashboard.pagination.totalPages} with up to {PAGE_SIZE} rows per page.
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {numberFormatter.format(dashboard.pagination.totalCount)} records found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {dashboard.transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <CalendarRange className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No transactions in this range</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the date filter to review more transaction history.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">#{transaction.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{transaction.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.storeName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatIDR(transaction.totalAmount)}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatIDR(transaction.profit)}
                      </TableCell>
                      <TableCell>{numberFormatter.format(transaction.itemCount)}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.createdAt ? formatWIB(transaction.createdAt) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/users/Transactions/${transaction.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {dashboard.pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-
                {Math.min(safePage * PAGE_SIZE, dashboard.pagination.totalCount)} of{" "}
                {numberFormatter.format(dashboard.pagination.totalCount)} transactions
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {safePage <= 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildPageHref(fromValue, toValue, searchValue, selectedStoreId, safePage - 1)}>
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  </Button>
                )}

                {visiblePages.map((visiblePage) => (
                  <Button
                    key={visiblePage}
                    asChild
                    size="sm"
                    variant={visiblePage === safePage ? "default" : "outline"}
                  >
                    <Link href={buildPageHref(fromValue, toValue, searchValue, selectedStoreId, visiblePage)}>
                      {visiblePage}
                    </Link>
                  </Button>
                ))}

                {safePage >= dashboard.pagination.totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildPageHref(fromValue, toValue, searchValue, selectedStoreId, safePage + 1)}>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
