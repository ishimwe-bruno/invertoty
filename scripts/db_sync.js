import sequelize from '../config/db.js';
import * as userSeed from '../database/seeds/seed_users.js';
import * as productSeed from '../database/seeds/seed_products.js';

const runMigrations = async () => {
  const forceSync = process.env.DB_SYNC_FORCE === 'true';
  console.log('\nRunning schema sync...\n');
  await sequelize.sync({ force: forceSync, alter: false, logging: false });
  console.log(`Schema sync complete (force=${forceSync})`);
};

const runSeeds = async () => {
  console.log('\nSeeding database...\n');
  try {
    await userSeed.up();
    await productSeed.up();
  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
};

const main = async () => {
  try {
    console.log('Connecting to database...\n');
    await sequelize.authenticate();
    console.log('Database connected\n');

    await runMigrations();
    await runSeeds();

    console.log('\nDatabase setup complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed.');
    console.error(`Reason: ${err?.name || 'Error'} - ${err?.message || 'Unknown error'}`);
    if (err?.original?.code) {
      console.error(`DB code: ${err.original.code}`);
    }
    process.exit(1);
  }
};

main();
