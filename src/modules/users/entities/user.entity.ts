import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDetail } from './user-detail.entity';
import { Otp } from './otp.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from '../../rbac/entities/user-role.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ name: 'fcm_token', type: 'boolean', default: false })
  fcmToken?: string;

  @OneToOne(() => UserDetail, (detail) => detail.user)
  detail?: UserDetail;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps?: Otp[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens?: RefreshToken[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles?: UserRole[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
