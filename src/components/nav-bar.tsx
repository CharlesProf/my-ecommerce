"use client"

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
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left side - Logo */}
        <div className="flex items-center min-w-fit">
          <Link href="/users/home" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Store</span>
          </Link>
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
                  <Link href="/Transactions" className={navigationMenuTriggerStyle()}>
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
