
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqxrpvbduqsfdrqrtkdq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeHJwdmJkdXFzZmRycXJ0a2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjk1MTMsImV4cCI6MjA4NTk0NTUxM30.mF3zMHzNWZczbiLlLf5tbi6MYXHjQx6fXhrn6zYnPp4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
