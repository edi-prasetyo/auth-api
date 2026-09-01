import { DataSource } from 'typeorm';

export default class WhatsappSenderSeeder {
    constructor(private dataSource: DataSource) { }

    public async run(): Promise<void> {
        await this.dataSource.query(
            `INSERT IGNORE INTO whatsapp_senders (name, provider, api_url, api_key, sender_number, sender_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'StarSender API',
                'starsender',
                'https://api.starsender.online/api/send',
                'YOUR_STARSENDER_API_KEY',
                '08123456789',
                'Auth API',
                0,
            ],
        );

        await this.dataSource.query(
            `INSERT IGNORE INTO whatsapp_senders (name, provider, api_url, api_key, sender_number, sender_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'Fonnte API',
                'fonnte',
                'https://api.fonnte.com/send',
                'YOUR_FONNTE_API_TOKEN',
                '08123456789',
                'Auth API',
                1,
            ],
        );
    }
}
