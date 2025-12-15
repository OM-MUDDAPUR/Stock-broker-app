"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, ShoppingCart, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface Stock {
  id: string
  ticker: string
  name: string
}

interface Subscription {
  id: string
  current_price: number
  price_change: number
  price_change_percent: number
  shares: number
  stock: {
    ticker: string
    name: string
  }
}

type StockCardProps =
  | {
      mode: "subscribed"
      subscription: Subscription
      onSell: () => void
      onAddShares: () => void
      stock?: never
      onBuy?: never
    }
  | {
      mode: "unsubscribed"
      stock: Stock
      onBuy: () => void
      subscription?: never
      onSell?: never
      onAddShares?: never
    }

export default function StockCard(props: StockCardProps) {
  const [unsubscribedPrice, setUnsubscribedPrice] = useState<number>(
    props.mode === "unsubscribed" ? Number.parseFloat((Math.random() * 400 + 50).toFixed(2)) : 0,
  )
  const [priceChange, setPriceChange] = useState<number>(0)
  const [percentChange, setPercentChange] = useState<number>(0)

  useEffect(() => {
    if (props.mode === "unsubscribed") {
      const updatePrice = () => {
        const volatility = 0.02
        const randomChange = (Math.random() - 0.5) * 2 * volatility
        const multiplier = 1 + randomChange

        const newPrice = Math.max(10, unsubscribedPrice * multiplier)
        const change = newPrice - unsubscribedPrice
        const percent = (change / unsubscribedPrice) * 100

        setUnsubscribedPrice(Number.parseFloat(newPrice.toFixed(2)))
        setPriceChange(Number.parseFloat(change.toFixed(2)))
        setPercentChange(Number.parseFloat(percent.toFixed(2)))
      }

      const intervalId = setInterval(updatePrice, 1000)
      return () => clearInterval(intervalId)
    }
  }, [props.mode, unsubscribedPrice])

  if (props.mode === "subscribed") {
    const { subscription, onSell, onAddShares } = props
    const isPositive = subscription.price_change >= 0

    return (
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all border-border bg-card">
        <div className={`absolute top-0 left-0 right-0 h-1 ${isPositive ? "bg-green-500" : "bg-red-500"}`} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">{subscription.stock.ticker}</h3>
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    isPositive
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? "+" : ""}
                  {subscription.price_change_percent.toFixed(2)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{subscription.stock.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Current Price</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              ${subscription.current_price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Price Change</p>
              <p
                className={`text-base font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {isPositive ? "+" : ""}${Math.abs(subscription.price_change).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground mb-1">Live Status</p>
              <div className="flex items-center gap-1.5 justify-end">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">Active</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Shares Owned</p>
                <p className="text-xl font-bold text-foreground">{subscription.shares}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Value</p>
                <p className="text-xl font-bold text-foreground">
                  ${(subscription.current_price * subscription.shares).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onAddShares} variant="outline" size="sm" className="flex-1 bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Buy More
              </Button>
              <Button
                onClick={onSell}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
              >
                Sell Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Unsubscribed stock card
  const { stock, onBuy } = props
  const isPositive = priceChange >= 0

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all border-border bg-card">
      <div className={`absolute top-0 left-0 right-0 h-1 ${isPositive ? "bg-green-500" : "bg-red-500"}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">{stock.ticker}</h3>
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPositive
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? "+" : ""}
                {percentChange.toFixed(2)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Current Price</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">${unsubscribedPrice.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Price Change</p>
            <p
              className={`text-base font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {isPositive ? "+" : ""}${Math.abs(priceChange).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground mb-1">Live Status</p>
            <div className="flex items-center gap-1.5 justify-end">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-semibold text-foreground">Active</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <Button onClick={onBuy} className="w-full" size="lg">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Stock
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
