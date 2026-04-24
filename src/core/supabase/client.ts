import { createClient } from '@supabase/supabase-js';

// These should normally come from environment variables.
// Using placeholders for the free-tier setup.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for generic database queries
export const getExams = async () => {
  const { data, error } = await supabase.from('exams').select('*');
  if (error) throw error;
  return data;
};
