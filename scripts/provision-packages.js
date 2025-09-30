// Provision packages table and policies using direct Postgres connection
// Usage: node scripts/provision-packages.js

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
    console.log('Connecting to database...')
    await client.connect()

    const createTableSQL = `
      create table if not exists public.packages (
        id bigserial primary key,
        name text not null,
        destination text not null,
        duration text not null,
        price numeric(10,2) not null,
        original_price numeric(10,2),
        description text,
        highlights text[] default '{}',
        includes text[] default '{}',
        category text default 'Adventure',
        status text default 'Active' check (status in ('Active','Inactive','Draft')),
        featured boolean default false,
        image text,
        route text,
        nights integer default 0,
        days integer default 0,
        trip_type text default 'custom' check (trip_type in ('custom','group')),
        bookings integer default 0,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );

      create index if not exists idx_packages_status on public.packages(status);
      create index if not exists idx_packages_featured on public.packages(featured);
      create index if not exists idx_packages_category on public.packages(category);
      create index if not exists idx_packages_trip_type on public.packages(trip_type);
    `

    console.log('Creating table public.packages if not exists...')
    await client.query(createTableSQL)

    console.log('Enabling RLS...')
    await client.query('alter table public.packages enable row level security;')

    console.log('Creating permissive policies if missing (dev)...')
    // Create policies only if they do not exist
    await client.query(`
      do $$ begin
        if not exists (
          select 1 from pg_policies where tablename = 'packages' and policyname = 'packages_select_public'
        ) then
          create policy "packages_select_public" on public.packages for select using (true);
        end if;
        if not exists (
          select 1 from pg_policies where tablename = 'packages' and policyname = 'packages_insert_public'
        ) then
          create policy "packages_insert_public" on public.packages for insert with check (true);
        end if;
        if not exists (
          select 1 from pg_policies where tablename = 'packages' and policyname = 'packages_update_public'
        ) then
          create policy "packages_update_public" on public.packages for update using (true) with check (true);
        end if;
        if not exists (
          select 1 from pg_policies where tablename = 'packages' and policyname = 'packages_delete_public'
        ) then
          create policy "packages_delete_public" on public.packages for delete using (true);
        end if;
      end $$;
    `)

    // Optional seed if empty
    console.log('Checking if packages table is empty...')
    const { rows } = await client.query('select count(*)::int as c from public.packages;')
    if (rows && rows[0] && rows[0].c === 0) {
      console.log('Seeding sample packages...')
      await client.query(`
        insert into public.packages
          (name, destination, duration, price, original_price, description, highlights, includes, category, status, featured, image, route, nights, days, trip_type, bookings)
        values
          ('Kashmir Summer Paradise','Kashmir, India','5 days / 4 nights',18999,22000,'A scenic Kashmir circuit through valleys and riverside charm',
           ARRAY['Scenic valleys','Riverside charm'], ARRAY['Accommodation','Meals','Transport'], 'Adventure','Active', true, '/cards/1.jpg','Srinagar → Gulmarg → Pahalgam',4,5,'custom',15),
          ('Kashmir Group Adventure','Kashmir, India','5 days / 4 nights',15999,19000,'Group adventure through Kashmir with fellow travelers',
           ARRAY['Group adventure','Fellow travelers'], ARRAY['Accommodation','Meals','Transport'], 'Adventure','Active', false, '/cards/1.jpg','Srinagar → Gulmarg → Pahalgam',4,5,'group',12)
        on conflict do nothing;
      `)
    } else {
      console.log('Packages table already has data, skipping seed.')
    }

    console.log('Done. ✅ Packages table and policies are ready.')
  } catch (e) {
    console.error('Provisioning failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
