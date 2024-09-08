import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data.json')

interface Data {
  accounts: Account[];
  transactions: Transaction[];
}

interface Account {
  name: string;
  balance: number;
}

interface Transaction {
  id: string;
  account: string;
  amount: number;
  btcPrice: number;
  date: string;
}

const readData = (): Data => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return { accounts: [], transactions: [] }
  }
}

const writeData = (data: Data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing data:', error)
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = readData()
    res.status(200).json(data.transactions)
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    const data = readData()
    const index = data.transactions.findIndex(t => t.id === id)
    if (index !== -1) {
      data.transactions.splice(index, 1)
      writeData(data)
      res.status(200).json({ success: true })
    } else {
      res.status(404).json({ success: false, error: 'Transaction not found' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}