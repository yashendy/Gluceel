# Gluceel Frontend

Front-end pages for Supabase-backed authentication and registration flows.

## Supabase `users` table checklist
Before testing registration/login, verify the `users` table matches the expected schema and row-level rules so Auth IDs are stored correctly.

### Column types
| Column | Expected type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Must match the Auth user `id`; set as primary key and `not null`. |
| `email` | `text` | Set `not null`; ideally unique to avoid duplicates. |
| `name` | `text` | Optional display name. |
| `role` | `text` | Default to `user` unless your app needs more roles. |
| `status` | `text` | e.g., `active`, `pending`, or `disabled`. |
| `created_at` | `timestamp with time zone` | Default `now()` so new rows auto-populate. |

If any column currently uses `text` instead of `uuid` for `id`, change it to `uuid` and link it to the Auth users table (e.g., set a foreign key to `auth.users(id)`), then backfill existing rows to the proper UUIDs.

### Row Level Security (RLS)
Enable RLS on the `users` table and add policies such as:
- **Select:** allow authenticated users to select their own row (`id = auth.uid()`).
- **Insert:** allow authenticated users to insert a row only for themselves (`id = auth.uid()`).
- **Update:** allow authenticated users to update only their own row.

Adjust policies if you need admin access (e.g., roles stored in JWT claims).

### Quick verification steps
1. In Supabase table editor, confirm column types match the table above and that `id` is UUID.
2. Confirm RLS is enabled and policies are present for select/insert/update.
3. Save changes, then run registration/login flows from `index.html` and `register.html` to ensure new users appear with the correct UUID in `users`.
