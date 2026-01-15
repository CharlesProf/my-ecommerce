import { AdminLayout } from "@/components/side-bar";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { getAdminUser } from "@/lib/cache/userCache";

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Check if user exists in database, create if not
  const dbUser = await getAdminUser(clerkUser.id);

  // Check if user is admin
  if (dbUser?.role !== "admin") {
    redirect("/");
  }

  return (
    <ClerkProvider>
      <AdminLayout>{children}</AdminLayout>
    </ClerkProvider>
  );
}