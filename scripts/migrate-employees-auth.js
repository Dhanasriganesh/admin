// Migration: add auth_user_id and unique email to employees
// Usage: node scripts/migrate-employees-auth.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL
  if (!databaseUrl) {
    console.error('Missing SUPABASE_DB_URL in environment (.env.local)')
    process.exit(1)
  }
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query(`
      alter table public.employees add column if not exists auth_user_id uuid;
      do $$ begin
        if not exists (
          select 1 from pg_constraint 
          where conrelid = 'public.employees'::regclass 
            and conname = 'employees_email_key'
        ) then
          alter table public.employees add constraint employees_email_key unique (email);
        end if;
      end $$;
      create index if not exists idx_employees_auth_user_id on public.employees(auth_user_id);
    `)
    console.log('Migration applied ✅')
  } catch (e) {
    console.error('Migration failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

