import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Zap, Users, Shield } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">StockFlow</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Professional Stock Trading Platform</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Track and monitor your portfolio with real-time market data. Subscribe to your preferred stocks and
                receive instant price updates across all your devices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
              <div className="bg-card border border-border rounded-lg p-6 space-y-2 hover:bg-accent/5 transition-colors">
                <Zap className="h-8 w-8 text-primary mx-auto" />
                <p className="font-semibold text-foreground">Real-time Updates</p>
                <p className="text-sm text-muted-foreground">Live price tracking</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 space-y-2 hover:bg-accent/5 transition-colors">
                <Users className="h-8 w-8 text-primary mx-auto" />
                <p className="font-semibold text-foreground">Multi-user Support</p>
                <p className="text-sm text-muted-foreground">Collaborative platform</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 space-y-2 hover:bg-accent/5 transition-colors">
                <Shield className="h-8 w-8 text-primary mx-auto" />
                <p className="font-semibold text-foreground">Secure Authentication</p>
                <p className="text-sm text-muted-foreground">Protected accounts</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto min-w-[180px]">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px] bg-transparent">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
