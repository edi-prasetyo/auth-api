import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

export default class UserSeeder {
  constructor(private dataSource: DataSource) {}

  public async run(): Promise<void> {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '08125525555',
        password: hashedPassword,
        isVerified: 1,
        isActive: 1,
        role: 'admin',
      },
      {
        name: 'Moderator User',
        email: 'moderator@example.com',
        phone: '08125525556',
        password: hashedPassword,
        isVerified: 1,
        isActive: 1,
        role: 'moderator',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        phone: '08125525557',
        password: hashedPassword,
        isVerified: 1,
        isActive: 1,
        role: 'user',
      },
    ];

    for (const user of users) {
      await this.dataSource.query(
        'INSERT IGNORE INTO users (name, email, phone, password, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.phone, user.password, user.isVerified, user.isActive],
      );
    }

    const adminRole = (await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['admin'],
    )) as any[];
    const moderatorRole = (await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['moderator'],
    )) as any[];
    const userRole = (await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['user'],
    )) as any[];

    const adminUser = (await this.dataSource.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@example.com'],
    )) as any[];
    const moderatorUser = (await this.dataSource.query(
      'SELECT id FROM users WHERE email = ?',
      ['moderator@example.com'],
    )) as any[];
    const regularUser = (await this.dataSource.query(
      'SELECT id FROM users WHERE email = ?',
      ['user@example.com'],
    )) as any[];

    if (adminUser.length > 0 && adminRole.length > 0) {
      await this.dataSource.query(
        'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [adminUser[0].id, adminRole[0].id],
      );
    }

    if (moderatorUser.length > 0 && moderatorRole.length > 0) {
      await this.dataSource.query(
        'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [moderatorUser[0].id, moderatorRole[0].id],
      );
    }

    if (regularUser.length > 0 && userRole.length > 0) {
      await this.dataSource.query(
        'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [regularUser[0].id, userRole[0].id],
      );
    }
  }
}
