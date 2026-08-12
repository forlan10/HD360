import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyptrjpzhtqceqdbewtl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cHRyanB6aHRxY2VxZGJld3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjU2NTksImV4cCI6MjEwMTc0MTY1OX0.dnnrylzko52SXsBtkH4bU3zTRcBdCqH5eiSaYPvEvoI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
