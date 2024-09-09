import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Supabase client initialized:', !!supabase)
  if (req.method === 'POST') {
    try {
      console.log('Received POST request:', JSON.stringify(req.body, null, 2))
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

      console.log('Transaction inserted successfully')

      // Update account balance
      console.log('Updating account balance:', { account, amount: parseFloat(amount) / parseFloat(btcPrice) })
      const { error: updateError } = await supabase.rpc('update_account_balance', {
        p_account: account,
        p_amount: parseFloat(amount) / parseFloat(btcPrice)
      })

      if (updateError) {
        console.error('Error updating account balance:', updateError)
        return res.status(500).json({ 
          success: false, 
          error: updateError.message,
          details: JSON.stringify(updateError)
        })
      }

      console.log('Account balance updated successfully')
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error in stack API:', error)
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}