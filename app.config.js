
window.APP_CONFIG = {
  PUBLIC_SITE_URL: "https://yashendy.github.io/gluceel-web/",
  BASE_PATH: "/gluceel-web/",
  SUPABASE_URL: "https://ekczlogtrfpupgjlysfv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrY3psb2d0cmZwdXBnamx5c2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxMDU5ODEsImV4cCI6MjAzMzY4MTk4MX0.3I3x_22LWS1bx_1VCX2djjL_G0tAtGv_b7fC_unQl6I",

  TABLES: {
    profiles: "profiles",
    user_settings: "user_settings",
    children: "children",
    child_guardians: "child_guardians",
    measurements: "measurements",
    meals: "meals",
    meal_items: "meal_items",
    targets: "targets",
    rewards_points_ledger: "rewards_points_ledger",
    shares: "share_access",
    food_items: "food_items"
  },

  COLUMNS: {
    profiles: {
      user_id: "user_id",
      role: "role",
      full_name: "full_name",
      phone: "phone",
    },
    children:     { id: "id", name: "display_name" },
    measurements: { id:"id", child_id:"child_id", value:"glucose_mgdl", context:"context", at:"observed_at", notes:"notes" },
    targets:      { child_id:"child_id", low:"low_mgdl", high:"high_mgdl" }
  },

  AI: {
    MODE: "local",
    LOCALE_DEFAULT: "ar",
    USE_CHILD_CONTEXT_DEFAULT: true,
    PRIVACY: "local-only"
  }
};
