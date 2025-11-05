
import type { Child, Measurement, Profile, Summary, Target, FoodItem, UserSettings } from '../types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';
import { supabase } from './supabaseClient';

// --- AUTH & PROFILE API ---

export const api = {
    // --- REAL AUTH & PROFILE METHODS ---
    signOut: async () => supabase.auth.signOut(),

    getOwnProfile: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: null, error: new Error('Not authenticated') };

        const { data, error } = await supabase
            .from(window.APP_CONFIG.TABLES.profiles)
            .select('*')
            .eq('user_id', session.user.id)
            .single();
        
        // Add avatar_url from auth metadata for convenience
        if (data && session.user.user_metadata) {
            (data as any).avatar_url = session.user.user_metadata.avatar_url;
        }

        return { data: data as Profile | null, error };
    },

    getOwnSettings: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: null, error: new Error('Not authenticated') };
        
        const { data, error } = await supabase
            .from(window.APP_CONFIG.TABLES.user_settings)
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        return { data: data as UserSettings | null, error };
    },

    listChildren: async () => {
        // NOTE: Returning MOCK children for now to ensure dashboard works with mock data keys.
        // Replace with real data fetching when dashboard data sources are real.
        return mockRequest<Child[]>(mockChildren);
    },

    // --- MOCK DATA SECTION (for dashboard functionality) ---
    listMeasurements: async (childId: string, limit = 100) => {
        const data = (mockMeasurements[childId] || []).slice(-limit);
        return mockRequest<Measurement[]>(data);
    },

    addMeasurement: async (childId: string, value: number, context: string) => {
        const newMeasurement: Measurement = {
            id: uuidv4(),
            value,
            context,
            at: new Date().toISOString(),
        };
        if (!mockMeasurements[childId]) {
            mockMeasurements[childId] = [];
        }
        mockMeasurements[childId].push(newMeasurement);
        return mockRequest<{ data: Measurement }>( { data: newMeasurement }, null, 200);
    },

    getTargets: async (childId: string) => {
        return mockRequest<Target | null>(mockTargets[childId]?.data || null);
    },

    getSummary: async (childId: string) => {
        return mockRequest<Summary[]>(mockSummaries[childId]?.data || []);
    },

    listFoodItems: async () => {
        return mockRequest<FoodItem[]>(mockFoodItems);
    },
    
    addFoodItem: async (item: Omit<FoodItem, 'id'>) => {
        const newItem: FoodItem = { ...item, id: uuidv4() };
        mockFoodItems.push(newItem);
        return mockRequest(newItem, null, 300);
    },

    updateFoodItem: async (item: FoodItem) => {
        const index = mockFoodItems.findIndex(f => f.id === item.id);
        if (index > -1) {
            mockFoodItems[index] = item;
            return mockRequest(item, null, 300);
        }
        return mockRequest(null, { message: 'Item not found' });
    },

    deleteFoodItem: async (id: string) => {
        mockFoodItems = mockFoodItems.filter(f => f.id !== id);
        return mockRequest({ success: true }, null, 300);
    },
};


// --- MOCK DATA ---
const MOCK_CHILD_ID_1 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const MOCK_CHILD_ID_2 = 'b2c3d4e5-f6a7-8901-2345-67890abcdef1';

const mockChildren: Child[] = [
    { id: MOCK_CHILD_ID_1, name: 'Adam' },
    { id: MOCK_CHILD_ID_2, name: 'Sara' },
];

const generateMockMeasurements = (childId: string, num: number): Measurement[] => {
    const measurements: Measurement[] = [];
    let value = 120;
    const contexts = ['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch', 'Before Dinner', 'After Dinner', 'Bedtime', 'Night Correction'];
    for (let i = 0; i < num; i++) {
        const date = new Date();
        date.setHours(date.getHours() - i * 3);
        
        const fluctuation = (Math.random() - 0.45) * 50; 
        value += fluctuation;
        if (value < 40) value = 40 + Math.random() * 20;
        if (value > 400) value = 400 - Math.random() * 50;

        measurements.push({
            id: uuidv4(),
            value: Math.round(value),
            context: contexts[i % contexts.length],
            at: date.toISOString(),
        });
    }
    return measurements.reverse();
};

const mockMeasurements: { [key: string]: Measurement[] } = {
    [MOCK_CHILD_ID_1]: generateMockMeasurements(MOCK_CHILD_ID_1, 50),
    [MOCK_CHILD_ID_2]: generateMockMeasurements(MOCK_CHILD_ID_2, 50),
};

const mockTargets: { [key: string]: { data: Target | null } } = {
    [MOCK_CHILD_ID_1]: { data: { child_id: MOCK_CHILD_ID_1, low: 70, high: 180 } },
    [MOCK_CHILD_ID_2]: { data: { child_id: MOCK_CHILD_ID_2, low: 80, high: 200 } },
};

const mockSummaries: { [key: string]: { data: Summary[] } } = {
    [MOCK_CHILD_ID_1]: {
        data: [
            { child_id: MOCK_CHILD_ID_1, period_days: 7, avg_glucose: 145, time_in_range: 0.72, time_above_range: 0.23, time_below_range: 0.05, num_measurements: 56 },
            { child_id: MOCK_CHILD_ID_1, period_days: 14, avg_glucose: 152, time_in_range: 0.68, time_above_range: 0.28, time_below_range: 0.04, num_measurements: 112 },
            { child_id: MOCK_CHILD_ID_1, period_days: 30, avg_glucose: 148, time_in_range: 0.70, time_above_range: 0.25, time_below_range: 0.05, num_measurements: 240 },
        ]
    },
    [MOCK_CHILD_ID_2]: {
        data: [
            { child_id: MOCK_CHILD_ID_2, period_days: 7, avg_glucose: 160, time_in_range: 0.65, time_above_range: 0.30, time_below_range: 0.05, num_measurements: 54 },
            { child_id: MOCK_CHILD_ID_2, period_days: 14, avg_glucose: 155, time_in_range: 0.69, time_above_range: 0.27, time_below_range: 0.04, num_measurements: 109 },
            { child_id: MOCK_CHILD_ID_2, period_days: 30, avg_glucose: 158, time_in_range: 0.67, time_above_range: 0.29, time_below_range: 0.04, num_measurements: 230 },
        ]
    }
};

let mockFoodItems: FoodItem[] = [
    { id: uuidv4(), name_ar: 'تفاح', name_en: 'Apple', brand: 'Generic', category: 'Fruit', per100: { carbs_g: 14, kcal: 52 }, is_active: true },
    { id: uuidv4(), name_ar: 'خبز أبيض', name_en: 'White Bread', brand: 'L\'usine', category: 'Bakery', per100: { carbs_g: 49, kcal: 265 }, is_active: true },
    { id: uuidv4(), name_ar: 'دجاج مشوي', name_en: 'Grilled Chicken', brand: 'Generic', category: 'Meat', per100: { carbs_g: 0, protein_g: 31, kcal: 165 }, is_active: false },
    { id: uuidv4(), name_ar: 'أرز أبيض', name_en: 'White Rice', brand: 'Generic', category: 'Grains', per100: { carbs_g: 28, kcal: 130 }, is_active: true },
];

const mockRequest = <T,>(data: T, error: any = null, delay = 50) => {
    return new Promise<{ data: T | null; error: any; }>((resolve) => {
        setTimeout(() => {
            if (error) {
                resolve({ data: null, error });
            } else {
                resolve({ data, error: null });
            }
        }, delay);
    });
};
