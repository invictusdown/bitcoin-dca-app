"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: string;
  account: string;
  amount: number;
  btcPrice: number;
  date: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = () => {
    fetch('/api/transactions')
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Error fetching transactions:', error))
  }

  const removeTransaction = (transaction: Transaction) => {
    fetch(`/api/transactions?id=${transaction.id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete transaction')
        }
        return response.json()
      })
      .then(() => {
        fetchTransactions() // Refresh transactions after removing
        router.refresh() // Refresh the entire page to update "At a Glance" data
      })
      .catch(error => console.error('Error removing transaction:', error))
  }

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8 font-mono">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold">All Transactions</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {transactions.map(transaction => (
          <Alert key={transaction.id} className="flex justify-between items-center">
            <AlertDescription>
              {new Date(transaction.date).toLocaleString()}: {transaction.account} - 
              ${transaction.amount.toFixed(2)} @ ${transaction.btcPrice.toFixed(2)}
            </AlertDescription>
            <Button 
              className="text-red-500 hover:text-red-700 transition-colors p-0 bg-transparent hover:bg-transparent"
              onClick={() => removeTransaction(transaction)}
            >
              X
            </Button>
          </Alert>
        ))}
      </div>
    </main>
  )
}