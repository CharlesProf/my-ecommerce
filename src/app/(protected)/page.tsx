import { Button } from "@/components/ui/button"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function Home() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get user role from database
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id))
    .limit(1)

  const userRole = dbUser?.role || 'user'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <h1 className="text-4xl font-bold">Welcome to My App</h1>
      <p className="text-muted-foreground">
        You are now signed in as {userRole}!
      </p>
      <form action={async () => {
        'use server'
        if (userRole === 'admin') {
          redirect('/admin')
        } else {
          redirect('/users/profile')
        }
      }}>
        <Button type="submit">Continue</Button>
      </form>
    </div>
  )
}
