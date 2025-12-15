"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import StockCard from "./stock-card"
import { TrendingUp, UserIcon, DollarSign, Activity, TrendingDown } from "lucide-react"

interface Stock {
  id: string
  ticker: string
  name: string
}

interface Subscription {
  id: string
  stock_id: string
  current_price: number
  price_change: number
  price_change_percent: number
  shares: number
  stock: Stock
}

export default function DashboardClient({ user }: { user: User }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [supportedStocks, setSupportedStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"portfolio" | "user">("portfolio")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: subs, error: subsError } = await supabase
          .from("subscriptions")
          .select(`
            id,
            stock_id,
            current_price,
            price_change,
            price_change_percent,
            shares,
            stock:supported_stocks(id, ticker, name)
          `)
          .eq("user_id", user.id)

        if (subsError) throw subsError
        setSubscriptions(subs as Subscription[])

        const { data: stocks, error: stocksError } = await supabase.from("supported_stocks").select("*")

        if (stocksError) throw stocksError
        setSupportedStocks(stocks as Stock[])

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [user.id, supabase])

  useEffect(() => {
    const updatePrices = () => {
      setSubscriptions((prev) =>
        prev.map((sub) => {
          const volatility = 0.02
          const randomChange = (Math.random() - 0.5) * 2 * volatility
          const multiplier = 1 + randomChange

          const newPrice = Math.max(10, sub.current_price * multiplier)
          const priceChange = newPrice - sub.current_price
          const percentChange = (priceChange / sub.current_price) * 100

          return {
            ...sub,
            current_price: Number.parseFloat(newPrice.toFixed(2)),
            price_change: Number.parseFloat(priceChange.toFixed(2)),
            price_change_percent: Number.parseFloat(percentChange.toFixed(2)),
          }
        }),
      )
    }

    const intervalId = setInterval(updatePrices, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const subscription = supabase
      .channel(`user_${user.id}_subscriptions`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const { data: subs } = await supabase
            .from("subscriptions")
            .select(`
              id,
              stock_id,
              current_price,
              price_change,
              price_change_percent,
              shares,
              stock:supported_stocks(id, ticker, name)
            `)
            .eq("user_id", user.id)
          if (subs) setSubscriptions(subs as Subscription[])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user.id, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleBuy = async (stockId: string) => {
    try {
      console.log("[v0] Buying stock:", stockId)

      const existing = subscriptions.find((sub) => sub.stock_id === stockId)

      if (existing) {
        console.log("[v0] Already subscribed, adding shares")
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.stock_id === stockId ? { ...sub, shares: sub.shares + 1 } : sub)),
        )

        const { error } = await supabase
          .from("subscriptions")
          .update({ shares: existing.shares + 1 })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        console.log("[v0] Creating new subscription")
        const stock = supportedStocks.find((s) => s.id === stockId)

        if (!stock) throw new Error("Stock not found")

        const newPrice = Number.parseFloat((Math.random() * 400 + 50).toFixed(2))

        const tempSubscription: Subscription = {
          id: `temp-${Date.now()}`, // temporary ID
          stock_id: stockId,
          current_price: newPrice,
          price_change: 0,
          price_change_percent: 0,
          shares: 1,
          stock: stock,
        }

        setSubscriptions((prev) => [...prev, tempSubscription])

        const { data, error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            stock_id: stockId,
            current_price: newPrice,
            shares: 1,
          })
          .select(`
          id,
          stock_id,
          current_price,
          price_change,
          price_change_percent,
          shares,
          stock:supported_stocks(id, ticker, name)
        `)
          .single()

        if (error) throw error

        if (data) {
          setSubscriptions((prev) => prev.map((sub) => (sub.id === tempSubscription.id ? (data as Subscription) : sub)))
        }
      }

      console.log("[v0] Buy successful")
    } catch (error) {
      console.error("Error buying stock:", error)
      const { data: subs } = await supabase
        .from("subscriptions")
        .select(`
          id,
          stock_id,
          current_price,
          price_change,
          price_change_percent,
          shares,
          stock:supported_stocks(id, ticker, name)
        `)
        .eq("user_id", user.id)
      if (subs) setSubscriptions(subs as Subscription[])
    }
  }

  const handleSell = async (subscriptionId: string, currentShares: number) => {
    try {
      console.log("[v0] Selling share from:", subscriptionId, "current shares:", currentShares)

      if (currentShares <= 1) {
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId))
      } else {
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? { ...sub, shares: sub.shares - 1 } : sub)),
        )
      }

      if (currentShares <= 1) {
        console.log("[v0] Removing subscription (last share)")
        const { error } = await supabase.from("subscriptions").delete().eq("id", subscriptionId)
        if (error) throw error
      } else {
        console.log("[v0] Reducing shares to:", currentShares - 1)
        const { error } = await supabase
          .from("subscriptions")
          .update({ shares: currentShares - 1 })
          .eq("id", subscriptionId)
        if (error) throw error
      }

      console.log("[v0] Sell successful")
    } catch (error) {
      console.error("Error selling stock:", error)
      const { data: subs } = await supabase
        .from("subscriptions")
        .select(`
          id,
          stock_id,
          current_price,
          price_change,
          price_change_percent,
          shares,
          stock:supported_stocks(id, ticker, name)
        `)
        .eq("user_id", user.id)
      if (subs) setSubscriptions(subs as Subscription[])
    }
  }

  const handleAddShares = async (subscriptionId: string, currentShares: number) => {
    try {
      console.log("[v0] Adding share to:", subscriptionId, "current shares:", currentShares)

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subscriptionId ? { ...sub, shares: sub.shares + 1 } : sub)),
      )

      const { error } = await supabase
        .from("subscriptions")
        .update({ shares: currentShares + 1 })
        .eq("id", subscriptionId)

      if (error) throw error

      console.log("[v0] Add shares successful, new total:", currentShares + 1)
    } catch (error) {
      console.error("Error adding shares:", error)
      const { data: subs } = await supabase
        .from("subscriptions")
        .select(`
          id,
          stock_id,
          current_price,
          price_change,
          price_change_percent,
          shares,
          stock:supported_stocks(id, ticker, name)
        `)
        .eq("user_id", user.id)
      if (subs) setSubscriptions(subs as Subscription[])
    }
  }

  const subscribedStocks = subscriptions
  const unsubscribedStocks = supportedStocks.filter((stock) => !subscriptions.some((sub) => sub.stock_id === stock.id))

  const totalShares = subscriptions.reduce((sum, sub) => sum + sub.shares, 0)
  const totalValue = subscriptions.reduce((sum, sub) => sum + sub.current_price * sub.shares, 0)
  const totalChange = subscriptions.reduce((sum, sub) => sum + sub.price_change * sub.shares, 0)
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0
  const positiveStocks = subscriptions.filter((sub) => sub.price_change >= 0).length
  const negativeStocks = subscriptions.filter((sub) => sub.price_change < 0).length

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">StockBroker Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "portfolio"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Portfolio</span>
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "user"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {activeTab === "portfolio" ? (
          <>
            {subscriptions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Change</p>
                      {totalChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p
                      key={`change-${totalChange}`}
                      className={`text-2xl font-bold ${totalChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs font-medium ${totalChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {totalChange >= 0 ? "+" : ""}
                      {totalChangePercent.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Holdings</p>
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{subscriptions.length}</p>
                    <p className="text-xs text-muted-foreground">Active stocks</p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Performance</p>
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{positiveStocks}</p>
                      <span className="text-muted-foreground">/</span>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{negativeStocks}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Gainers / Losers</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-foreground">Loading your portfolio</p>
                  <p className="text-xs text-muted-foreground">Fetching real-time data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Subscribed Stocks</h2>
                    <span className="text-sm text-muted-foreground">{subscribedStocks.length} holdings</span>
                  </div>
                  {subscribedStocks.length === 0 ? (
                    <Card className="border-dashed border-2">
                      <CardContent className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                          No subscribed stocks yet. Buy stocks from the available section below.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subscribedStocks.map((subscription) => (
                        <StockCard
                          key={subscription.id}
                          subscription={subscription}
                          onSell={() => handleSell(subscription.id, subscription.shares)}
                          onAddShares={() => handleAddShares(subscription.id, subscription.shares)}
                          mode="subscribed"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Available Stocks</h2>
                    <span className="text-sm text-muted-foreground">{unsubscribedStocks.length} available</span>
                  </div>
                  {unsubscribedStocks.length === 0 ? (
                    <Card className="border-dashed border-2">
                      <CardContent className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">You've subscribed to all available stocks!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unsubscribedStocks.map((stock) => (
                        <StockCard key={stock.id} stock={stock} onBuy={() => handleBuy(stock.id)} mode="unsubscribed" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">User Profile</h2>
                    <p className="text-sm text-muted-foreground">Manage your account details</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-base font-medium text-foreground">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">User ID</p>
                    <p className="text-sm font-mono text-foreground break-all">{user.id}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Account Created
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Account Statistics
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Holdings</p>
                        <p key={`holdings-${subscriptions.length}`} className="text-2xl font-bold text-foreground">
                          {subscriptions.length}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Shares</p>
                        <p key={`shares-${totalShares}`} className="text-2xl font-bold text-foreground">
                          {totalShares}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
