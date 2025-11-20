import { createClient } from '@supabase/supabase-js';

// Diese Daten wurden aus deinem vorherigen Code extrahiert.
const supabaseUrl = "https://ucsohhuoimbpnqgfaeqd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc29oaHVvaW1icG5xZ2ZhZXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTM0NTgsImV4cCI6MjA3OTE2OTQ1OH0.snN9KPR-mFTLruWbZ4UCyxThd4ihBsFhX63mvPyopf0";

export const supabase = createClient(supabaseUrl, supabaseKey);
