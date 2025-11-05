
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type User = SupabaseUser;
export type Session = SupabaseSession;

export type GlucoseUnit = 'mg/dL' | 'mmol/L';

/**
 * Represents the `profiles` table in the database.
 */
export interface Profile {
  user_id: string;
  full_name: string | null;
  role: 'guardian' | 'admin' | 'doctor';
  phone: string | null;
  // avatar_url is part of user_metadata in auth.users, not the profiles table
  avatar_url?: string; 
}

/**
 * Represents the `user_settings` table in the database.
 */
export interface UserSettings {
  user_id: string;
  locale: string;
  timezone: string;
  unit_glucose: GlucoseUnit;
  // ... other settings from the schema can be added here
}


export interface Child {
  id: string; // Changed from number to string for UUID
  name: string;
}

export interface Measurement {
  id: string; // Changed from number to string for UUID
  value: number; // Stored as mg/dL
  context: string;
  at: string; // ISO string date
}

export interface Target {
  child_id: string; // Changed from number to string for UUID
  low: number;  // Stored as mg/dL
  high: number; // Stored as mg/dL
}

export interface Summary {
  child_id: string; // Changed from number to string for UUID
  period_days: number;
  avg_glucose: number;
  time_in_range: number; // as a fraction, e.g., 0.75 for 75%
  time_above_range: number;
  time_below_range: number;
  num_measurements: number;
}

export interface FoodItem {
  id: string; // uuid
  name_ar: string;
  name_en?: string | null;
  brand?: string | null;
  category?: string | null;
  per100: {
    carbs_g?: number | null;
    fiber_g?: number | null;
    kcal?: number | null;
    protein_g?: number | null;
    fat_g?: number | null;
  };
  is_active: boolean;
}

export interface FoodMeasure {
  id: string; // uuid
  food_id: string; // uuid
  label: string;
  grams: number;
}
