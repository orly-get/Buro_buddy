import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mtwlmvstxemicebioxdn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d2xtdnN0eGVtaWNlYmlveGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ1MDksImV4cCI6MjA5Nzk3MDUwOX0.oCYLjT4Dyp9tSj-gb0Cdra5mVbCWCsOrXiroU2kxXJw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
