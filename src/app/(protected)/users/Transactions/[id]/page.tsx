import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  getTransactionDetails,
  getAvailableProductsForStore,
} from "@/lib/services/transaction.service";
import { getUser } from "@/lib/cache/userCache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, User, Phone, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatIDR, formatWIB } from "@/lib/utils/currency";
import { AddTransactionItemForm } from "./add-transaction-item-form";
import { CancelTransactionButton } from "./cancel-transaction-button";
import { CompleteTransactionButton } from "./complete-transaction-button";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = await params;
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getUser(clerkUser.id);
  const isAdmin = dbUser?.role === "admin";

  const transaction = await getTransactionDetails(id, clerkUser.id, isAdmin);

  if (!transaction) {
    notFound();
  }

  const availableProducts = await getAvailableProductsForStore(transaction.storeId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/users/Transactions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Transaction Details</h1>
        <p className="text-sm text-muted-foreground">
          Transaction ID: {transaction.id}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={transaction.status === "completed" ? "default" : transaction.status === "cancelled" ? "destructive" : "secondary"}>
                {transaction.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Amount</span>
              <span className="font-semibold">{formatIDR(transaction.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Method</span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                {transaction.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {transaction.createdAt ? formatWIB(transaction.createdAt) : "-"}
              </span>
            </div>
            {transaction.status === "pending" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <CompleteTransactionButton transactionId={transaction.id} />
                <CancelTransactionButton transactionId={transaction.id} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Name</span>
              <span>{transaction.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phone</span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {transaction.customerPhone}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Store</span>
              <span>{transaction.storeName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items Purchased</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaction.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatIDR(item.price)}</TableCell>
                  <TableCell>{formatIDR(Number(item.price) * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6">
        <AddTransactionItemForm
          transactionId={transaction.id}
          storeId={transaction.storeId}
          status={transaction.status}
          availableProducts={availableProducts}
        />
      </div>
    </div>
  );
}