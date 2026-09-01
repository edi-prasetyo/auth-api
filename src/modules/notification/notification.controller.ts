import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateMailerDto } from './dto/create-mailer.dto';
import { CreateWhatsappSenderDto } from './dto/create-whatsapp-sender.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ==================== MAILER ====================

  @Post('mailers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create mailer configuration' })
  @ApiBody({ type: CreateMailerDto })
  @ApiResponse({ status: 201, description: 'Mailer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMailer(@Body() createMailerDto: CreateMailerDto) {
    return this.notificationService.createMailer(createMailerDto);
  }

  @Get('mailers')
  @ApiOperation({ summary: 'Get all mailer configurations' })
  @ApiResponse({ status: 200, description: 'Return all mailers' })
  async findAllMailers() {
    return this.notificationService.findAllMailers();
  }

  @Get('mailers/:id')
  @ApiOperation({ summary: 'Get mailer by ID' })
  @ApiResponse({ status: 200, description: 'Return mailer by ID' })
  @ApiResponse({ status: 404, description: 'Mailer not found' })
  async findOneMailer(@Param('id') id: string) {
    return this.notificationService.findOneMailer(parseInt(id, 10));
  }

  @Patch('mailers/:id')
  @ApiOperation({ summary: 'Update mailer configuration' })
  @ApiBody({ type: CreateMailerDto })
  @ApiResponse({ status: 200, description: 'Mailer updated successfully' })
  @ApiResponse({ status: 404, description: 'Mailer not found' })
  async updateMailer(
    @Param('id') id: string,
    @Body() updateMailerDto: CreateMailerDto,
  ) {
    return this.notificationService.updateMailer(
      parseInt(id, 10),
      updateMailerDto,
    );
  }

  @Delete('mailers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete mailer configuration' })
  @ApiResponse({ status: 200, description: 'Mailer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mailer not found' })
  async removeMailer(@Param('id') id: string) {
    return this.notificationService.removeMailer(parseInt(id, 10));
  }

  // ==================== WHATSAPP SENDER ====================

  @Post('whatsapp-senders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create WhatsApp sender configuration' })
  @ApiBody({ type: CreateWhatsappSenderDto })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp sender created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createWhatsappSender(@Body() createDto: CreateWhatsappSenderDto) {
    return this.notificationService.createWhatsappSender(createDto);
  }

  @Get('whatsapp-senders')
  @ApiOperation({ summary: 'Get all WhatsApp sender configurations' })
  @ApiResponse({ status: 200, description: 'Return all WhatsApp senders' })
  async findAllWhatsappSenders() {
    return this.notificationService.findAllWhatsappSenders();
  }

  @Get('whatsapp-senders/:id')
  @ApiOperation({ summary: 'Get WhatsApp sender by ID' })
  @ApiResponse({ status: 200, description: 'Return WhatsApp sender by ID' })
  @ApiResponse({ status: 404, description: 'WhatsApp sender not found' })
  async findOneWhatsappSender(@Param('id') id: string) {
    return this.notificationService.findOneWhatsappSender(parseInt(id, 10));
  }

  @Patch('whatsapp-senders/:id')
  @ApiOperation({ summary: 'Update WhatsApp sender configuration' })
  @ApiBody({ type: CreateWhatsappSenderDto })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp sender updated successfully',
  })
  @ApiResponse({ status: 404, description: 'WhatsApp sender not found' })
  async updateWhatsappSender(
    @Param('id') id: string,
    @Body() updateDto: CreateWhatsappSenderDto,
  ) {
    return this.notificationService.updateWhatsappSender(
      parseInt(id, 10),
      updateDto,
    );
  }

  @Delete('whatsapp-senders/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete WhatsApp sender configuration' })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp sender deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'WhatsApp sender not found' })
  async removeWhatsappSender(@Param('id') id: string) {
    return this.notificationService.removeWhatsappSender(parseInt(id, 10));
  }
}
