"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Account {
  name: string;
  balance: number;
}

export default function Home() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountBalance, setNewAccountBalance] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [usdAmount, setUsdAmount] = useState("")

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(response => response.json())
      .then(data => setBitcoinPrice(data.bitcoin.usd))
      .catch(error => console.error('Error fetching Bitcoin price:', error))
  }, [])

  const addAccount = () => {
    if (newAccountName && newAccountBalance) {
      setAccounts([...accounts, { name: newAccountName, balance: parseFloat(newAccountBalance) }])
      setNewAccountName("")
      setNewAccountBalance("")
    }
  }

  const stackSats = () => {
    if (selectedAccount && bitcoinPrice && usdAmount) {
      const btcAmount = parseFloat(usdAmount) / bitcoinPrice
      setAccounts(accounts.map(account => 
        account.name === selectedAccount 
          ? { ...account, balance: account.balance + btcAmount }
          : account
      ))
      setUsdAmount("")
    }
  }

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8 font-mono">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold">Bitcoin DCA Calculator</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-lg">Home</a>
              <a href="#" className="text-lg">About</a>
              <a href="#" className="text-lg">Contact</a>
              <div className="pt-4">
                <h3 className="text-lg font-semibold">Add Account</h3>
                <Input
                  type="text"
                  placeholder="Account Name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="mt-2"
                />
                <Input
                  type="number"
                  placeholder="Starting Balance (BTC)"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                  className="mt-2"
                />
                <Button onClick={addAccount} className="mt-2">Add Account</Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-4 w-[80%] sm:w-[600px] mx-auto">
        <div className="w-full">
          {bitcoinPrice && (
            <Alert>
              <AlertTitle>Current Bitcoin Price</AlertTitle>
              <AlertDescription>
                ${bitcoinPrice.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Select onValueChange={setSelectedAccount} value={selectedAccount || undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account, index) => (
              <SelectItem key={index} value={account.name}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-full">
          {selectedAccount && (
            <Alert>
              <AlertTitle>Selected Account</AlertTitle>
              <AlertDescription>
                {selectedAccount}: {accounts.find(a => a.name === selectedAccount)?.balance.toFixed(8)} BTC
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Input
            type="number"
            placeholder="USD Amount to Stack"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            className="w-full sm:flex-grow"
          />
          <Button onClick={stackSats} className="w-full sm:w-auto">Stack Now</Button>
        </div>
      </div>
    </main>
  )
}