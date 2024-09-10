"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: number;  // Change this to number
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
      .then(data => {
        console.log('Transactions fetched:', data);
        setTransactions(data);
      })
      .catch(error => console.error('Error fetching transactions:', error));
  }

  const removeTransaction = (transaction: Transaction) => {
    console.log('Attempting to remove transaction:', transaction.id);
    fetch(`/api/transactions?id=${transaction.id}`, { method: 'DELETE' })
      .then(async response => {
        console.log('Delete response:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
          throw new Error(`Failed to delete transaction: ${response.status} ${response.statusText} ${responseText}`);
        }
        
        return JSON.parse(responseText);
      })
      .then(data => {
        console.log('Delete successful:', data);
        setTransactions(prevTransactions => 
          prevTransactions.filter(t => t.id !== transaction.id)
        );
        router.refresh();
      })
      .catch(error => {
        console.error('Error removing transaction:', error);
        // Optionally, you can show an error message to the user here
      });
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