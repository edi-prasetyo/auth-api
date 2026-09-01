import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WhatsappProvider {
  STARSENDER = 'starsender',
  FONNTE = 'fonnte',
}

@Entity('whatsapp_senders')
export class WhatsappSender {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({
    type: 'enum',
    enum: WhatsappProvider,
    default: WhatsappProvider.STARSENDER,
  })
  provider!: WhatsappProvider;

  @Column({ name: 'api_url', type: 'varchar', length: 255, nullable: true })
  apiUrl?: string;

  @Column({ name: 'api_key', type: 'varchar', length: 255, nullable: true })
  apiKey?: string;

  @Column({
    name: 'sender_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  senderNumber?: string;

  @Column({ name: 'sender_name', type: 'varchar', length: 100, nullable: true })
  senderName?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
