import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mvxqemhzciocszdjcmqs.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eHFlbWh6Y2lvY3N6ZGpjbXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzYyMzQsImV4cCI6MjA3OTExMjIzNH0.N9Vcr1Epie06ud6x9p3sueY_8kVoI-p7Pj8vpNE_tMQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});
