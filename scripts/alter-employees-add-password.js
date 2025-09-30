// Add password_hash column to public.employees if missing
// Usage: node scripts/alter-employees-add-password.js

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

    const res = await client.query(`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = 'employees' and column_name = 'password_hash';
    `)

    if (res.rowCount === 0) {
      console.log('Adding password_hash column to public.employees...')
      await client.query("alter table public.employees add column password_hash text;")
      console.log('Done. ✅')
    } else {
      console.log('password_hash column already exists. ✅')
    }
  } catch (e) {
    console.error('Alter failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
