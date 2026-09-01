import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WhatsappProvider } from '../entities/whatsapp-sender.entity';

export class CreateWhatsappSenderDto {
  @ApiProperty({
    example: 'My WhatsApp Sender',
    description: 'WhatsApp sender configuration name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: WhatsappProvider,
    example: WhatsappProvider.STARSENDER,
    description: 'WhatsApp provider type',
  })
  @IsEnum(WhatsappProvider)
  provider!: WhatsappProvider;

  @ApiPropertyOptional({
    example: 'https://api.starsender.online/api/send',
    description: 'API URL',
  })
  @IsOptional()
  @IsString()
  apiUrl?: string;

  @ApiPropertyOptional({
    example: 'YOUR_API_KEY',
    description: 'API key for authentication',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({
    example: '08123456789',
    description: 'Sender phone number',
  })
  @IsOptional()
  @IsString()
  senderNumber?: string;

  @ApiPropertyOptional({ example: 'My App', description: 'Sender name' })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ example: true, description: 'Is this sender active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
