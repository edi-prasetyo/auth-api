import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MailerProvider {
  SMTP = 'smtp',
  GMAIL = 'gmail',
  SENDGRID = 'sendgrid',
}

@Entity('mailers')
export class Mailer {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: MailerProvider, default: MailerProvider.SMTP })
  provider!: MailerProvider;

  @Column({ name: 'host', type: 'varchar', length: 255, nullable: true })
  host?: string;

  @Column({ name: 'port', type: 'int', nullable: true })
  port?: number;

  @Column({ name: 'secure', type: 'boolean', default: false })
  secure?: boolean;

  @Column({ name: 'user', type: 'varchar', length: 255, nullable: true })
  user?: string;

  @Column({ name: 'pass', type: 'varchar', length: 255, nullable: true })
  pass?: string;

  @Column({ name: 'from_email', type: 'varchar', length: 255, nullable: true })
  fromEmail?: string;

  @Column({ name: 'from_name', type: 'varchar', length: 255, nullable: true })
  fromName?: string;

  @Column({ name: 'api_key', type: 'varchar', length: 255, nullable: true })
  apiKey?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
