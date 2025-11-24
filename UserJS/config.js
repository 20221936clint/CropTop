// Supabase Configuration
const SUPABASE_URL = 'https://isjmawdwipxcpcrgjnjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzam1hd2R3aXB4Y3BjcmdqbmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDcyNTQsImV4cCI6MjA3ODUyMzI1NH0.iuZZQhQ6Lp9BC15UAo3dW1D8RNdOHQ4jHldIau0X2K0';

// Initialize Supabase client
let supabase = null;

// Check if Supabase library is loaded
if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully in config.js');
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        alert('Error: Unable to connect to database. Please refresh the page.');
    }
} else {
    console.error('Supabase library not loaded! Make sure the CDN script is included before this file.');
    alert('Error: Database library not loaded. Please refresh the page.');
}

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };