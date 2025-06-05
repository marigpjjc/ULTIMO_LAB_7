import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dxjdefkaoncphvjmkxoi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4amRlZmthb25jcGh2am1reG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTA1NzIsImV4cCI6MjA2NDU4NjU3Mn0.QLX9WKAcBQZeNjyzC7dc8Mz1FTQ7_KMwd7vVQCPkKnU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
