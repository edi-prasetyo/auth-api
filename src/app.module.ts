import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './database/data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/entities/user.entity';
import { UserDetail } from './modules/users/entities/user-detail.entity';
import { Otp } from './modules/users/entities/otp.entity';
import { RefreshToken } from './modules/users/entities/refresh-token.entity';
import { UsersModule } from './modules/users/users.module';
import { Role } from './modules/rbac/entities/role.entity';
import { Permission } from './modules/rbac/entities/permission.entity';
import { RolePermission } from './modules/rbac/entities/role-permission.entity';
import { UserRole } from './modules/rbac/entities/user-role.entity';
import { RbacModule } from './modules/rbac/rbac.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      entities: [
        User,
        UserDetail,
        Otp,
        RefreshToken,
        Role,
        Permission,
        RolePermission,
        UserRole,
      ],
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
