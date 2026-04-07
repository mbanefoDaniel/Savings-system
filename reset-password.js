require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

async function main() {
  await client.connect();
  const res = await client.query(
    `INSERT INTO "Organizer" (id, email, name, password, "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())
     RETURNING email`,
    [
      'admin@nefotech.ng',
      'Admin',
      'f02b0f91e2723708725af436ea90c00e:e6c30add59ca3c339fdb04d54a1e0079b116294496817ff916f10e2ef5b6dccd042fefc013926f76972c6720ffeb7db5c1b9ba43537858b96348079bfdec52fd'
    ]
  );
  console.log('Created admin:', res.rows[0].email);
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
