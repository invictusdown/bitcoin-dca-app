import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: number;  // Changed to number to match the database type
  account: string;
  amount: number;
  btcPrice: number;
  date: string;
}

export async function GET() {
  console.log('GET request received for transactions');
  const { data, error: fetchError } = await supabase
    .from('transactions')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching transactions:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  
  const transactions: Transaction[] = data || [];
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

  const transaction = transactionToDelete as Transaction;
  console.log('Transaction to delete:', transaction);

  if (!transaction) {
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
    p_account: transaction.account,
    p_amount: -(transaction.amount / transaction.btcPrice)
  });

  if (updateError) {
    console.error('Error updating account balance:', updateError);
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  console.log('Account balance updated successfully');
  return NextResponse.json({ success: true });
}