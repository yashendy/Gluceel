
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = window.APP_CONFIG.SUPABASE_URL;
const supabaseAnonKey = window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Key must be defined in app.config.js");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
