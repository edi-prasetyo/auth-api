import { DataSource } from 'typeorm';

export default class RbacSeeder {
  constructor(private dataSource: DataSource) {}

  public async run(): Promise<void> {
    const roles = ['admin', 'user', 'moderator'];
    const permissions = [
      'create_user',
      'read_user',
      'update_user',
      'delete_user',
      'manage_roles',
      'manage_permissions',
    ];

    for (const roleName of roles) {
      await this.dataSource.query(
        'INSERT IGNORE INTO roles (name, description) VALUES (?, ?)',
        [roleName, `${roleName} role`],
      );
    }

    for (const permissionName of permissions) {
      await this.dataSource.query(
        'INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)',
        [permissionName, `${permissionName} permission`],
      );
    }

    const adminRole = await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['admin'],
    );
    const moderatorRole = await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['moderator'],
    );
    const userRole = await this.dataSource.query(
      'SELECT id FROM roles WHERE name = ?',
      ['user'],
    );

    const allPermissions = await this.dataSource.query(
      'SELECT id FROM permissions',
    );

    if (adminRole.length > 0 && allPermissions.length > 0) {
      for (const permission of allPermissions) {
        await this.dataSource.query(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [adminRole[0].id, permission.id],
        );
      }
    }

    const readUserPermission = await this.dataSource.query(
      'SELECT id FROM permissions WHERE name = ?',
      ['read_user'],
    );
    const createUserPermission = await this.dataSource.query(
      'SELECT id FROM permissions WHERE name = ?',
      ['create_user'],
    );

    if (moderatorRole.length > 0) {
      const moderatorPermissions = [
        readUserPermission[0]?.id,
        createUserPermission[0]?.id,
      ].filter(Boolean);
      for (const permissionId of moderatorPermissions) {
        await this.dataSource.query(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [moderatorRole[0].id, permissionId],
        );
      }
    }

    if (userRole.length > 0) {
      const userPermissions = [readUserPermission[0]?.id].filter(Boolean);
      for (const permissionId of userPermissions) {
        await this.dataSource.query(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [userRole[0].id, permissionId],
        );
      }
    }
  }
}
