import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called:', req.method)
  try {
    if (req.method === 'GET') {
      console.log('Fetching accounts...')
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')

      if (error) {
        console.error('Supabase error:', error)
        res.status(500).json({ error: 'Supabase error', details: error.message })
        return
      }

      console.log('Accounts fetched:', accounts)
      res.status(200).json(accounts)
    } else if (req.method === 'POST') {
      const newAccount = req.body
      const { data, error } = await supabase
        .from('accounts')
        .insert(newAccount)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      res.status(200).json({ success: true, data })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error: unknown) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}