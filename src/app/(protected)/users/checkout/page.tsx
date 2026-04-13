import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";
import { getStoresForUser } from "@/lib/services/store.service";

export default async function UserCheckoutPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const stores = await getStoresForUser(clerkUser.id);
  const serializedStores = stores.map((store) => ({
    id: store.id || "",
    name: store.name || "",
  }));

  return <CheckoutClient stores={serializedStores} />;
}
