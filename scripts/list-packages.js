// List recent packages for debugging
// Usage: node scripts/list-packages.js

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
    const { rows } = await client.query(`
      select id, name, status, trip_type, image, created_at
      from public.packages
      order by created_at desc
      limit 10;
    `)
    console.table(rows)
  } catch (e) {
    console.error('List failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

