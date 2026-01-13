import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <h1 className="text-4xl font-bold">Welcome to My App</h1>
      <p className="text-muted-foreground">
        You are now signed in!
      </p>
      <Button>Continue</Button>
    </div>
  )
}
