"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/sign-in" />
        <ThemeToggle />
      </div>
    </header>
  );
}
