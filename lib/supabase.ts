
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suotjybgnklsdlxzvihb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1b3RqeWJnbmtsc2RseHp2aWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzkzNDksImV4cCI6MjA4NzA1NTM0OX0.Kmw-qYDt2LDleAmLI_gIKx8EStzvGnct99V2tCOvfsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
