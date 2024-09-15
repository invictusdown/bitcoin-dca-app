'use client'

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'

interface Account {
  name: string;
  balance: number;
}

export default function Component() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountBalance, setNewAccountBalance] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [usdAmount, setUsdAmount] = useState("")

  useEffect(() => {
    fetchBitcoinPrice()
    fetchAccounts()
    const interval = setInterval(fetchBitcoinPrice, 60000) // Update price every minute
    return () => clearInterval(interval)
  }, [])

  const fetchBitcoinPrice = () => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(response => response.json())
      .then(data => setBitcoinPrice(data.bitcoin.usd))
      .catch(error => console.error('Error fetching Bitcoin price:', error))
  }

  const fetchAccounts = () => {
    fetch('/api/accounts')
      .then(response => response.json())
      .then(data => setAccounts(data))
      .catch(error => console.error('Error fetching accounts:', error))
  }

  const addAccount = () => {
    if (newAccountName && newAccountBalance) {
      const newAccount = { name: newAccountName, balance: parseFloat(newAccountBalance) }
      fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })
        .then(response => response.json())
        .then(() => {
          fetchAccounts()
          setNewAccountName("")
          setNewAccountBalance("")
        })
        .catch(error => console.error('Error adding account:', error))
    }
  }

  const stackSats = () => {
    if (selectedAccount && bitcoinPrice && usdAmount) {
      const btcAmount = parseFloat(usdAmount) / bitcoinPrice
      const transaction = {
        account: selectedAccount,
        amount: parseFloat(usdAmount),
        btcPrice: bitcoinPrice
      }
      fetch('/api/stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
        .then(response => response.json())
        .then(() => {
          setAccounts(accounts.map(account => 
            account.name === selectedAccount 
              ? { ...account, balance: account.balance + btcAmount }
              : account
          ))
          setUsdAmount("")
          fetchAccounts()
        })
        .catch(error => console.error('Error stacking sats:', error))
    }
  }

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  }

  const refreshData = () => {
    fetchBitcoinPrice()
    fetchAccounts()
  }

  return (
    <main className="min-h-screen flex flex-col p-4 font-mono bg-black text-green-400">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-green-500 glitch" data-text="Bitcoin DCA Calculator">
          Bitcoin DCA Calculator
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-green-500 text-green-500 hover:bg-green-900">
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-black border-l border-green-500">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-lg text-green-400 hover:text-green-300">Home</Link>
              <Link href="/transactions" className="text-lg text-green-400 hover:text-green-300">All Transactions</Link>
              <Button onClick={refreshData} className="mt-2 bg-green-700 text-black hover:bg-green-600">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
              </Button>
              <div className="pt-4 border-t border-green-700">
                <h3 className="text-lg font-semibold text-green-500">At a Glance</h3>
                <p>Total Balance: {calculateTotalBalance().toFixed(8)} BTC</p>
                {bitcoinPrice && (
                  <p>USD Value: ${(calculateTotalBalance() * bitcoinPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
              <div className="pt-4 border-t border-green-700">
                <h3 className="text-lg font-semibold text-green-500">Add Account</h3>
                <Input
                  type="text"
                  placeholder="Account Name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="mt-2 bg-black border-green-500 text-green-400 placeholder-green-700"
                />
                <Input
                  type="number"
                  placeholder="Starting Balance (BTC)"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                  className="mt-2 bg-black border-green-500 text-green-400 placeholder-green-700"
                />
                <Button onClick={addAccount} className="mt-2 bg-green-700 text-black hover:bg-green-600">Add Account</Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-4 w-full max-w-3xl mx-auto">
        <div className="w-full bg-green-900/20 border border-green-500 p-4 rounded-md terminal-window">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-green-500">System Status</div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          {bitcoinPrice && (
            <Alert className="bg-transparent border-green-500">
              <AlertTitle className="text-green-400">Current Bitcoin Price</AlertTitle>
              <AlertDescription className="text-2xl font-bold text-green-500">
                ${bitcoinPrice.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="w-full bg-green-900/20 border border-green-500 p-4 rounded-md terminal-window">
          <Select onValueChange={setSelectedAccount} value={selectedAccount || undefined}>
            <SelectTrigger className="w-full bg-black border-green-500 text-green-400">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-500">
              {accounts.map((account, index) => (
                <SelectItem key={index} value={account.name} className="text-green-400">{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAccount && (
            <Alert className="mt-4 bg-transparent border-green-500">
              <AlertDescription className="text-green-400">
                {selectedAccount}: {accounts.find(a => a.name === selectedAccount)?.balance.toFixed(8)} BTC
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full mt-4">
            <Input
              type="number"
              placeholder="USD Amount to Stack"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              className="w-full sm:flex-grow bg-black border-green-500 text-green-400 placeholder-green-700"
            />
            <Button onClick={stackSats} className="w-full sm:w-auto bg-green-700 text-black hover:bg-green-600">Stack Now</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-green-600 animate-pulse">
        Made by //AWB
      </div>
    </main>
  )
}