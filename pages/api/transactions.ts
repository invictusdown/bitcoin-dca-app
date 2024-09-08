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
  const { method, query } = req;

  switch (method) {
    case 'GET':
      const data = readData()
      res.status(200).json(data.transactions)
      break;
    case 'DELETE':
      const { id } = query
      if (typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid transaction ID' })
      }
      const deleteData = readData()
      const index = deleteData.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        const removedTransaction = deleteData.transactions.splice(index, 1)[0]
        // Update account balance
        const accountIndex = deleteData.accounts.findIndex(a => a.name === removedTransaction.account)
        if (accountIndex !== -1) {
          deleteData.accounts[accountIndex].balance -= removedTransaction.amount / removedTransaction.btcPrice
        }
        writeData(deleteData)
        res.status(200).json({ success: true })
      } else {
        // If transaction not found by ID, try to find it by other properties
        const transactionIndex = deleteData.transactions.findIndex(t => 
          t.account === query.account && 
          t.amount === parseFloat(query.amount as string) && 
          t.btcPrice === parseFloat(query.btcPrice as string) &&
          t.date === query.date
        )
        if (transactionIndex !== -1) {
          const removedTransaction = deleteData.transactions.splice(transactionIndex, 1)[0]
          const accountIndex = deleteData.accounts.findIndex(a => a.name === removedTransaction.account)
          if (accountIndex !== -1) {
            deleteData.accounts[accountIndex].balance -= removedTransaction.amount / removedTransaction.btcPrice
          }
          writeData(deleteData)
          res.status(200).json({ success: true })
        } else {
          res.status(404).json({ success: false, error: 'Transaction not found' })
        }
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}