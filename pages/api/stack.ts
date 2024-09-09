import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { account, amount, btcPrice } = req.body
    const transaction = {
      account,
      amount: parseFloat(amount),
      btcPrice: parseFloat(btcPrice),
      date: new Date().toISOString()
    }

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transaction)
      .single()

    if (insertError) {
      return res.status(500).json({ success: false, error: insertError.message })
    }

    // Update account balance
    const { error: updateError } = await supabase.rpc('update_account_balance', {
      p_account: account,
      p_amount: parseFloat(amount) / parseFloat(btcPrice)
    })

    if (updateError) {
      return res.status(500).json({ success: false, error: updateError.message })
    }

    res.status(200).json({ success: true })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}