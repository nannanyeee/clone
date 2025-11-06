import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmrkmfvirkhiekwebocs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcmttZnZpcmtoaWVrd2Vib2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTI3ODAsImV4cCI6MjA3Nzk4ODc4MH0.2gwfQtkNR0wMJJlqQ7iPsImKbXkOgqVcT7vcuuJkoVk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
