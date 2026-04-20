// Supabase Configuration
const SUPABASE_URL = 'https://dvvvpfsnwnkrwhiphvcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dnZwZnNud25rcndoaXBodmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzU4MjAsImV4cCI6MjA5MjI1MTgyMH0.ZoZ2KMfWlymBE0MxM17Rqy0JJ3oCZ-vK_OF7MzQPtzs';

// Initialize Supabase client
window.supabaseClient = null;

// Check if Supabase library is loaded
if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}