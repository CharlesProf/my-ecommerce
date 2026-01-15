import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CategoriesClient } from "./categories-client";
import { getAdminUser } from "@/lib/cache/userCache";
import { getAdminCategoryPageData } from "@/lib/services/category.service";

export default async function CategoriesPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await getAdminUser(clerkUser.id);
  if (!dbUser || dbUser.role !== "admin") redirect("/");

  const data = await getAdminCategoryPageData(clerkUser.id);

  return (
    <CategoriesClient
      stores={data.stores}
      categories={data.categories}
      subcategories={data.subcategories}
    />
  );
}
