// Provision employees table using direct Postgres connection
// Usage: node scripts/provision-employees.js

const path = require('path')
// Load env from .env.local in project root
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
    console.log('Connecting to database...')
    await client.connect()

    const sql = `
      create table if not exists public.employees (
        id bigserial primary key,
        name text not null,
        email text,
        phone text,
        destination text,
        role text default 'employee',
        status text default 'Active',
        password_hash text,
        is_first_login boolean default true,
        inserted_at timestamptz default now()
      );
    `
    
    const alterSql = `
      alter table public.employees add column if not exists destination text;
      alter table public.employees add column if not exists password_hash text;
      alter table public.employees add column if not exists is_first_login boolean default true;
    `

    console.log('Creating table public.employees if not exists...')
    await client.query(sql)
    
    console.log('Adding missing columns if needed...')
    await client.query(alterSql)

    console.log('Done. ✅')
  } catch (e) {
    console.error('Provisioning failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
