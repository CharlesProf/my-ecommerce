import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquareText,
  Search,
  Sparkles,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser } from "@/lib/cache/userCache";
import { findAdminStores } from "@/lib/repositories/store.repo";
import { getAdminCustomersPageData } from "@/lib/services/customer.service";
import { formatWIB } from "@/lib/utils/currency";

const PAGE_SIZE = 15;

type CustomersPageProps = {
  searchParams:
    | Promise<{ page?: string; search?: string; storeId?: string }>
    | { page?: string; search?: string; storeId?: string };
};

function buildPageHref(search: string, storeId: string, page: number) {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (storeId) {
    params.set("storeId", storeId);
  }
  params.set("page", String(page));
  return `/admin/customers?${params.toString()}`;
}

function getLeadBadgeVariant(status: string) {
  if (status === "vip") return "default";
  if (status === "repeat" || status === "active") return "secondary";
  return "outline";
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
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
  const search = params?.search?.trim() ?? "";
  const selectedStoreId = params?.storeId ?? "";
  const selectedStore =
    adminStores.find((store) => store.id === selectedStoreId) ?? null;
  const requestedPage = Number(params?.page ?? "1");
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const data = await getAdminCustomersPageData({
    adminId: clerkUser.id,
    storeId: selectedStore?.id,
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  if (page !== data.pagination.page) {
    redirect(buildPageHref(search, selectedStoreId, data.pagination.page));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-emerald-500/10 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-[0.2em] uppercase">
              Customer Leads
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Customers & Leads
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Bangun pondasi CRM sederhana dari customer yang sudah pernah beli,
                supaya nanti lebih mudah dikembangkan ke follow-up, broadcast, dan
                promosi WhatsApp.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-md border-border/60 bg-background/80 py-0 backdrop-blur">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Current Scope
                </p>
                <p className="text-base font-semibold">
                  {selectedStore?.name ?? "All shops"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Search by customer name, phone number, or address.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <CardTitle>Lead Filters</CardTitle>
          <CardDescription>
            Narrow the customer list by shop and keyword to find the right leads.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search customer
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Name, phone number, or address"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
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

            <Button type="submit" className="w-full md:w-auto">
              Apply
            </Button>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <Link href="/admin/customers">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 py-0">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted-foreground">Total leads</p>
            <p className="text-3xl font-bold">{data.summary.totalCustomers}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 py-0">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted-foreground">Repeat buyers</p>
            <p className="text-3xl font-bold">{data.summary.repeatCustomers}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 py-0">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted-foreground">Reachable by phone</p>
            <p className="text-3xl font-bold">{data.summary.reachableCustomers}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 py-0">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted-foreground">Customers with address</p>
            <p className="text-3xl font-bold">{data.summary.customersWithAddress}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 py-0">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Lead List</CardTitle>
              <CardDescription>
                Customer records ready to evolve into future outreach and CRM workflows.
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {data.pagination.totalCount} customers
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {data.customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No customer leads yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Once transactions are created, customer leads will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Purchase</TableHead>
                    <TableHead>Lead Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{customer.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            Seen in {customer.storeCount} store
                            {customer.storeCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {customer.address || "No address"}
                        </span>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>{formatIDR(customer.totalSpent)}</TableCell>
                      <TableCell>
                        {customer.lastPurchaseAt
                          ? formatWIB(customer.lastPurchaseAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLeadBadgeVariant(customer.leadStatus)}>
                          {customer.leadStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data.pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.pagination.page - 1) * PAGE_SIZE + 1}-
                {Math.min(data.pagination.page * PAGE_SIZE, data.pagination.totalCount)} of{" "}
                {data.pagination.totalCount} customers
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {data.pagination.page <= 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildPageHref(search, selectedStoreId, data.pagination.page - 1)}>
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  </Button>
                )}

                {data.pagination.page >= data.pagination.totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildPageHref(search, selectedStoreId, data.pagination.page + 1)}>
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

      <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-background py-0">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquareText className="h-5 w-5" />
              <p className="font-semibold">Future CRM Expansion</p>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Halaman ini sudah jadi basis customer leads. Nanti bisa dilanjutkan ke
              segmentasi promo, WhatsApp blast, reminder repeat order, atau follow-up
              pelanggan dormant.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
