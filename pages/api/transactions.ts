import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
      
      if (fetchError) {
        return res.status(500).json({ error: fetchError.message })
      }
      
      res.status(200).json(transactions)
      break;

    case 'DELETE':
      const { id } = query
      if (typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid transaction ID' })
      }

      const { data: deletedTransaction, error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .single() as { 
          data: { account: string; amount: number; btcPrice: number } | null; 
          error: PostgrestError | null 
        }

      if (deleteError) {
        return res.status(500).json({ success: false, error: deleteError.message })
      }

      if (deletedTransaction) {
        // Update account balance
        const { error: updateError } = await supabase.rpc('update_account_balance', {
          p_account: deletedTransaction.account,
          p_amount: -deletedTransaction.amount / deletedTransaction.btcPrice
        })

        if (updateError) {
          return res.status(500).json({ success: false, error: updateError.message })
        }

        res.status(200).json({ success: true })
      } else {
        res.status(404).json({ success: false, error: 'Transaction not found' })
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}