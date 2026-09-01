import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailer, MailerProvider } from './entities/mailer.entity';
import { WhatsappSender, WhatsappProvider } from './entities/whatsapp-sender.entity';
import { CreateMailerDto } from './dto/create-mailer.dto';
import { CreateWhatsappSenderDto } from './dto/create-whatsapp-sender.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Mailer)
    private mailerRepository: Repository<Mailer>,
    @InjectRepository(WhatsappSender)
    private whatsappSenderRepository: Repository<WhatsappSender>,
  ) { }

  // ==================== MAILER CRUD ====================

  async createMailer(createMailerDto: CreateMailerDto): Promise<Mailer> {
    const mailer = this.mailerRepository.create(createMailerDto);

    // If the new mailer is active, deactivate all others
    if (mailer.isActive) {
      await this.mailerRepository.update({}, { isActive: false });
    }

    return this.mailerRepository.save(mailer);
  }

  async findAllMailers(): Promise<Mailer[]> {
    return this.mailerRepository.find();
  }

  async findOneMailer(id: number): Promise<Mailer> {
    const mailer = await this.mailerRepository.findOne({ where: { id } });
    if (!mailer) {
      throw new NotFoundException('Mailer not found');
    }
    return mailer;
  }

  async updateMailer(
    id: number,
    updateMailerDto: CreateMailerDto,
  ): Promise<Mailer> {
    const mailer = await this.findOneMailer(id);
    Object.assign(mailer, updateMailerDto);

    // If updating to active, deactivate all others
    if (mailer.isActive) {
      await this.mailerRepository.update({ id: { $ne: id } as any }, { isActive: false });
    }

    return this.mailerRepository.save(mailer);
  }

  async removeMailer(id: number): Promise<void> {
    const mailer = await this.findOneMailer(id);
    await this.mailerRepository.remove(mailer);
  }

  // ==================== WHATSAPP SENDER CRUD ====================

  async createWhatsappSender(
    createDto: CreateWhatsappSenderDto,
  ): Promise<WhatsappSender> {
    const sender = this.whatsappSenderRepository.create(createDto);

    // If the new sender is active, deactivate all others
    if (sender.isActive) {
      await this.whatsappSenderRepository.update({}, { isActive: false });
    }

    return this.whatsappSenderRepository.save(sender);
  }

  async findAllWhatsappSenders(): Promise<WhatsappSender[]> {
    return this.whatsappSenderRepository.find();
  }

  async findOneWhatsappSender(id: number): Promise<WhatsappSender> {
    const sender = await this.whatsappSenderRepository.findOne({
      where: { id },
    });
    if (!sender) {
      throw new NotFoundException('WhatsApp sender not found');
    }
    return sender;
  }

  async updateWhatsappSender(
    id: number,
    updateDto: CreateWhatsappSenderDto,
  ): Promise<WhatsappSender> {
    const sender = await this.findOneWhatsappSender(id);
    Object.assign(sender, updateDto);

    // If updating to active, deactivate all others
    if (sender.isActive) {
      await this.whatsappSenderRepository.update({ id: { $ne: id } as any }, { isActive: false });
    }

    return this.whatsappSenderRepository.save(sender);
  }

  async removeWhatsappSender(id: number): Promise<void> {
    const sender = await this.findOneWhatsappSender(id);
    await this.whatsappSenderRepository.remove(sender);
  }

  // ==================== OTP SENDING ====================

  async getActiveMailer(): Promise<Mailer> {
    const mailer = await this.mailerRepository.findOne({
      where: { isActive: true },
    });
    if (!mailer) {
      throw new BadRequestException('No active mailer configuration found.');
    }
    return mailer;
  }

  async getActiveWhatsappSender(): Promise<WhatsappSender> {
    const sender = await this.whatsappSenderRepository.findOne({
      where: { isActive: true },
    });
    if (!sender) {
      throw new BadRequestException(
        'No active WhatsApp sender configuration found.',
      );
    }
    return sender;
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const mailer = await this.getActiveMailer();

    let transporter: nodemailer.Transporter;

    if (
      mailer.provider === MailerProvider.SMTP ||
      mailer.provider === MailerProvider.GMAIL
    ) {
      transporter = nodemailer.createTransport({
        host: mailer.host,
        port: mailer.port,
        secure: mailer.secure,
        auth: {
          user: mailer.user,
          pass: mailer.pass,
        },
      });
    } else if (mailer.provider === MailerProvider.SENDGRID) {
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: mailer.apiKey,
        },
      });
    } else {
      throw new BadRequestException('Unsupported mailer provider.');
    }

    const fromName = mailer.fromName || 'Auth API';
    const fromEmail = mailer.fromEmail || mailer.user;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'Your OTP Verification Code',
      text: `Your OTP code is: ${otpCode}. This code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Verification Code</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendOtpWhatsApp(to: string, otpCode: string): Promise<void> {
    const sender = await this.getActiveWhatsappSender();

    const message = `Your OTP verification code is: ${otpCode}. This code will expire in 5 minutes.`;

    if (sender.provider === WhatsappProvider.STARSENDER) {
      await this.sendStarsender(sender, to, message);
    } else if (sender.provider === WhatsappProvider.FONNTE) {
      await this.sendFonnte(sender, to, message);
    } else {
      throw new BadRequestException('Unsupported WhatsApp provider.');
    }
  }

  private async sendStarsender(
    sender: WhatsappSender,
    to: string,
    message: string,
  ): Promise<void> {
    const payload = {
      messageType: 'text',
      to: to.replace(/^0/, '62'),
      body: message,
    };

    const response = await fetch(
      sender.apiUrl || 'https://api.starsender.online/api/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: sender.apiKey || '',
        },
        body: JSON.stringify(payload),
      },
    );

    const result: unknown = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        `Failed to send WhatsApp message via StarSender: ${JSON.stringify(result)}`,
      );
    }
  }

  private async sendFonnte(
    sender: WhatsappSender,
    to: string,
    message: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('target', to.replace(/^0/, '62'));
    formData.append('message', message);
    formData.append('url', 'https://md.fonnte.com/images/wa-logo.png');
    formData.append('filename', 'otp');
    formData.append('schedule', '0');
    formData.append('typing', 'false');
    formData.append('delay', '2');
    formData.append('countryCode', '62');
    formData.append('followup', '0');
    formData.append('inboxid', '0');
    formData.append('duration', '1');

    const response = await fetch(
      sender.apiUrl || 'https://api.fonnte.com/send',
      {
        method: 'POST',
        headers: {
          Authorization: sender.apiKey || '',
        },
        body: formData,
      },
    );

    const result: unknown = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        `Failed to send WhatsApp message via Fonnte: ${JSON.stringify(result)}`,
      );
    }
  }
}
