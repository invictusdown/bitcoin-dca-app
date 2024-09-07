"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"

export default function Home() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(response => response.json())
      .then(data => setBitcoinPrice(data.bitcoin.usd))
      .catch(error => console.error('Error fetching Bitcoin price:', error))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Bitcoin DCA Calculator</h1>
      {bitcoinPrice && (
        <Alert>
          <AlertTitle>Current Bitcoin Price</AlertTitle>
          <AlertDescription>
            ${bitcoinPrice.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}
      <Button>Stack Now</Button>
    </main>
  )
}