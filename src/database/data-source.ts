import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserDetail } from '../modules/users/entities/user-detail.entity';
import { Otp } from '../modules/users/entities/otp.entity';
import { RefreshToken } from '../modules/users/entities/refresh-token.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { RolePermission } from '../modules/rbac/entities/role-permission.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { Mailer } from '../modules/notification/entities/mailer.entity';
import { WhatsappSender } from '../modules/notification/entities/whatsapp-sender.entity';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'db_auth',

  entities: [
    User,
    UserDetail,
    Otp,
    RefreshToken,
    Role,
    Permission,
    RolePermission,
    UserRole,
    Mailer,
    WhatsappSender,
  ],

  migrations: [
    __dirname + '/../modules/users/database/migrations/*{.ts,.js}',
    __dirname + '/../modules/rbac/database/migrations/*{.ts,.js}',
    __dirname + '/../modules/notification/database/migrations/*{.ts,.js}',
  ],

  synchronize: false,
};

const AppDataSource = new DataSource(config);
export default AppDataSource;
