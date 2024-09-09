import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase.from('accounts').select('count')
    if (error) throw error
    res.status(200).json({ message: 'Supabase connection successful', count: data[0].count })
  } catch (error: unknown) {
    console.error('Supabase connection error:', error)
    res.status(500).json({ error: 'Supabase connection failed', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}