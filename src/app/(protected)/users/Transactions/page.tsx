import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTransactionsForUser } from "@/lib/services/transaction.service";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/cache/userCache";
import { cancelTransaction } from "./actions";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatIDR, formatWIB } from "@/lib/utils/currency";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }> | { storeId?: string };
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const storeId = resolvedSearchParams?.storeId ?? "";

  const dbUser = await getUser(clerkUser.id);
  const isAdmin = dbUser?.role === "admin";
  const transactions = await getTransactionsForUser(clerkUser.id, isAdmin, storeId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Review transaction history and cancel orders when needed.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted p-8 text-center text-muted-foreground">
          No transactions found yet.
        </div>
      ) : (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.storeName}</TableCell>
                <TableCell>{transaction.customerName}</TableCell>
                <TableCell>{transaction.customerPhone}</TableCell>
                <TableCell>{formatIDR(transaction.totalAmount)}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>{transaction.createdAt ? formatWIB(transaction.createdAt) : "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/users/Transactions/${transaction.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <form action={cancelTransaction}>
                      <input type="hidden" name="transactionId" value={transaction.id} />
                      <Button
                        type="submit"
                        disabled={transaction.status === "cancelled" || transaction.status === "completed"}
                        variant={transaction.status === "cancelled" || transaction.status === "completed" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {transaction.status === "cancelled" ? "Cancelled" : transaction.status === "completed" ? "Completed" : "Cancel"}
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
