import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMailersTable1710000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mailers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        provider ENUM('smtp', 'gmail', 'sendgrid') DEFAULT 'smtp',
        host VARCHAR(255) NULL,
        port INT NULL,
        secure TINYINT(1) DEFAULT 0,
        user VARCHAR(255) NULL,
        pass VARCHAR(255) NULL,
        from_email VARCHAR(255) NULL,
        from_name VARCHAR(255) NULL,
        api_key VARCHAR(255) NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS mailers`);
  }
}
