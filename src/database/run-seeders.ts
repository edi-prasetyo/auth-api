import 'dotenv/config';
import AppDataSource from '../database/data-source';
import UserSeeder from '../modules/users/database/seeds/user.seeder';
import RbacSeeder from '../modules/rbac/database/seeds/rbac.seeder';

async function runSeeders(): Promise<void> {
  try {
    const dataSource = AppDataSource as unknown as {
      initialize: () => Promise<void>;
      destroy: () => Promise<void>;
      runMigrations: () => Promise<any[]>;
    };
    await dataSource.initialize();
    console.log('Data Source initialized.');

    const migrations = await dataSource.runMigrations();
    if (migrations.length > 0) {
      console.log(`${migrations.length} migration(s) executed.`);
    } else {
      console.log('No pending migrations.');
    }

    const userSeeder = new UserSeeder(dataSource as any);
    await userSeeder.run();
    console.log('User seeder executed.');

    const rbacSeeder = new RbacSeeder(dataSource as any);
    await rbacSeeder.run();
    console.log('RBAC seeder executed.');

    await dataSource.destroy();
    console.log('Data Source destroyed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

void runSeeders();
