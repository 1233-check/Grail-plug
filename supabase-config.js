// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://jclhkxbnwvdrasfcggwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGhreGJud3ZkcmFzZmNnZ3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDI0ODMsImV4cCI6MjA5Mjc3ODQ4M30.Ua13nW5IRz2I2wYjUF_HV0M0kAiFwsmLf7ccpEHl_BI';
const ADMIN_EMAILS = ['checkstudio01@gmail.com', 'tejugiri549@gmail.com', 'grailplug7@gmail.com', 'adiphurailatpam76@gmail.com'];

// Create client — use a different var name to avoid conflicting with the UMD global
const _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
