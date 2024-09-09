import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json(accounts)
  } else if (req.method === 'POST') {
    const newAccount = req.body
    const { data, error } = await supabase
      .from('accounts')
      .insert(newAccount)
      .single()

    if (error) {
      return res.status(500).json({ success: false, error: error.message })
    }

    res.status(200).json({ success: true, data })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}