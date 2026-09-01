import { DataSource } from 'typeorm';

export default class MailerSeeder {
    constructor(private dataSource: DataSource) { }

    public async run(): Promise<void> {
        await this.dataSource.query(
            `INSERT IGNORE INTO mailers (name, provider, host, port, secure, user, pass, from_email, from_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Mailtrap SMTP',
                'smtp',
                'smtp.mailtrap.io',
                2525,
                0,
                'your_mailtrap_username',
                'your_mailtrap_password',
                'noreply@example.com',
                'Auth API',
                1,
            ],
        );
    }
}
