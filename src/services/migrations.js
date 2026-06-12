const { Pool } = require('pg');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[Migrations] No DATABASE_URL set — skipping');
    return;
  }

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS service_base_address text`);
    await client.query(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS service_radius_miles integer DEFAULT 25`);
    await client.query(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS outside_radius_behavior text DEFAULT 'reject'`);
    await client.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_address text`);
    await client.query(`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_address text`);
    console.log('[Migrations] Service area + address columns ready');
  } finally {
    client.release();
    await pool.end();
  }
}

module.exports = { runMigrations };
