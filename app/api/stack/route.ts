import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { account, amount, btcPrice } = await request.json();
    console.log('Received POST request:', { account, amount, btcPrice });

    const transaction = {
      account,
      amount: parseFloat(amount),
      btcPrice: parseFloat(btcPrice),
      date: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transaction)
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    console.log('Transaction inserted successfully');

    // Update account balance
    console.log('Updating account balance:', { account, amount: parseFloat(amount) / parseFloat(btcPrice) });
    const { error: updateError } = await supabase.rpc('update_account_balance', {
      p_account: account,
      p_amount: parseFloat(amount) / parseFloat(btcPrice)
    });

    if (updateError) {
      console.error('Error updating account balance:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: updateError.message,
        details: JSON.stringify(updateError)
      }, { status: 500 });
    }

    console.log('Account balance updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in stack API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}