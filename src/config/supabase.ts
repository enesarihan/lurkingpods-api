import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Backend servisleri için service role key kullan (RLS bypass)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

// For testing environment, use mock values
if (process.env.NODE_ENV === 'test') {
  supabase = createClient('https://mock.supabase.co', 'mock_key');
} else {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:');
    console.error('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.error('SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
  
  console.log('Connecting to Supabase...');
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase connected successfully');
}

export { supabase };
export default supabase;
