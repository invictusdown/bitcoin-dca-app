import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  account: string;
  amount: number;
  btcPrice: number;
  date: string;
}

export async function GET() {
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching transactions:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  
  return NextResponse.json(transactions);
}

export async function DELETE(request: Request) {
  console.log('DELETE request received');
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  console.log('Transaction ID to delete:', id);

  if (!id) {
    console.error('Invalid transaction ID');
    return NextResponse.json({ success: false, error: 'Invalid transaction ID' }, { status: 400 });
  }

  const { data: deletedTransaction, error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .single();

  if (deleteError) {
    console.error('Error deleting transaction:', deleteError);
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
  }

  if (deletedTransaction) {
    console.log('Transaction deleted:', deletedTransaction);
    const { error: updateError } = await supabase.rpc('update_account_balance', {
      p_account: (deletedTransaction as Transaction).account,
      p_amount: -(deletedTransaction as Transaction).amount / (deletedTransaction as Transaction).btcPrice
    });

    if (updateError) {
      console.error('Error updating account balance:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    console.log('Account balance updated successfully');
    return NextResponse.json({ success: true });
  } else {
    console.error('Transaction not found');
    return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
  }
}