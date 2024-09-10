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
  console.log('GET request received for transactions');
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching transactions:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  
  console.log('Transactions retrieved:', transactions);
  return NextResponse.json(transactions);
}

export async function DELETE(request: Request) {
  console.log('DELETE request received');
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  console.log('Transaction ID to delete:', id);

  if (!id || isNaN(parseInt(id))) {
    console.error('Invalid transaction ID');
    return NextResponse.json({ success: false, error: 'Invalid transaction ID' }, { status: 400 });
  }

  const numericId = parseInt(id);

  // Log the transaction before deletion
  const { data: transactionToDelete, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', numericId)
    .single();

  if (fetchError) {
    console.error('Error fetching transaction to delete:', fetchError);
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  console.log('Transaction to delete:', transactionToDelete);

  if (!transactionToDelete) {
    console.error('Transaction not found');
    return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
  }

  const { data: deletedTransaction, error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', numericId)
    .single();

  if (deleteError) {
    console.error('Error deleting transaction:', deleteError);
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
  }

  console.log('Transaction deleted:', deletedTransaction);

  // Even if deletedTransaction is null, we know we've successfully deleted it
  const { error: updateError } = await supabase.rpc('update_account_balance', {
    p_account: transactionToDelete.account,
    p_amount: -(transactionToDelete.amount / transactionToDelete.btcPrice)
  });

  if (updateError) {
    console.error('Error updating account balance:', updateError);
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  console.log('Account balance updated successfully');
  return NextResponse.json({ success: true });
}