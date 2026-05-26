import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://mykjrlabehpipyyhniwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a2pybGFiZWhwaXB5eWhuaXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDYyNjEsImV4cCI6MjA5NTA4MjI2MX0.hPHQAn_salUbIy6ISeW5Li9kDyQw_Qq7Hg2B2jOtbk8';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default sb;
