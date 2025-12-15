"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Stock {
  id: string
  ticker: string
  name: string
}

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
  availableStocks: Stock[]
  onSubscribe: (stockId: string) => void
}

export default function SubscribeModal({ isOpen, onClose, availableStocks, onSubscribe }: SubscribeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubscribe = async (stockId: string) => {
    setIsLoading(true)
    await onSubscribe(stockId)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Subscribe to Stock</CardTitle>
          <CardDescription className="text-slate-400">Select a stock to add to your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {availableStocks.length === 0 ? (
            <p className="text-center text-slate-400 py-4">You're already subscribed to all available stocks!</p>
          ) : (
            <div className="space-y-2">
              {availableStocks.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => handleSubscribe(stock.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <p className="font-semibold text-white">{stock.ticker}</p>
                    <p className="text-sm text-slate-400">{stock.name}</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    Add
                  </Button>
                </button>
              ))}
            </div>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            disabled={isLoading}
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
