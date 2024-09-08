import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data.json')

const readData = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return { accounts: [], transactions: [] }
  }
}

const writeData = (data: any) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing data:', error)
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = readData()
    const { account, amount, btcPrice } = req.body
    const transaction = {
      account,
      amount: parseFloat(amount),
      btcPrice: parseFloat(btcPrice),
      date: new Date().toISOString()
    }
    data.transactions.push(transaction)
    
    // Update account balance
    const accountIndex = data.accounts.findIndex((a: any) => a.name === account)
    if (accountIndex !== -1) {
      data.accounts[accountIndex].balance += amount / btcPrice
    }
    
    writeData(data)
    res.status(200).json({ success: true })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}