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
  if (req.method === 'GET') {
    const data = readData()
    res.status(200).json(data.accounts)
  } else if (req.method === 'POST') {
    const data = readData()
    const newAccount = req.body
    data.accounts.push(newAccount)
    writeData(data)
    res.status(200).json({ success: true })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}