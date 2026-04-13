"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartSheet } from "@/components/cart-sheet"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const currentStore = params.get("storeId") ?? ""
    setSelectedStoreId(currentStore)

    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.stores)) {
          setStores(data.stores)
        }
      })
      .catch(() => {
        setStores([])
      })
  }, [])

  const handleStoreChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStore = event.target.value
    setSelectedStoreId(nextStore)
    const params = new URLSearchParams(window.location.search)

    if (nextStore) {
      params.set("storeId", nextStore)
    } else {
      params.delete("storeId")
    }

    const queryString = params.toString()
    router.push(`${window.location.pathname}${queryString ? `?${queryString}` : ""}`)
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left side - Logo */}
        <div className="flex items-center min-w-fit gap-3">
          <Link href="/users/home" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              {stores.find((store) => store.id === selectedStoreId)?.name || "Store"}
            </span>
          </Link>
          {stores.length > 0 ? (
            <select
              value={selectedStoreId}
              onChange={handleStoreChange}
              className="hidden md:block rounded-full border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary"
            >
              <option value="">All stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {/* Center - Navigation Menu (hidden on mobile) */}
        <div className="hidden md:flex justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/users/home" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories & Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/products"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Categories & Products
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Browse our Categories & Products
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/products/featured" title="Featured">
                      Check out our featured store products 
                    </ListItem>
                    <ListItem href="/products/new" title="New Arrivals">
                      Latest products just added
                    </ListItem>
                    <ListItem href="/products/sale" title="Sale">
                      Special offers and discounts
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/users/Transactions" className={navigationMenuTriggerStyle()}>
                    Transactions
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/About" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/Settings" className={navigationMenuTriggerStyle()}>
                    Settings
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Cart, User Button and Theme Toggle */}
        <div className="flex items-center justify-end gap-2 md:gap-4">
          <CartSheet />
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function ListItem({
  className,
  title,
  children,
  href,
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
