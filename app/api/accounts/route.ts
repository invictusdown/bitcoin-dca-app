import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  console.log('Fetching accounts...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Key set:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*');

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('Accounts fetched:', accounts);
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const newAccount = await request.json();
  const { data, error } = await supabase
    .from('accounts')
    .insert(newAccount)
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}