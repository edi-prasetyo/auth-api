import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailerProvider } from '../entities/mailer.entity';

export class CreateMailerDto {
  @ApiProperty({
    example: 'My SMTP Mailer',
    description: 'Mailer configuration name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: MailerProvider,
    example: MailerProvider.SMTP,
    description: 'Mailer provider type',
  })
  @IsEnum(MailerProvider)
  provider!: MailerProvider;

  @ApiPropertyOptional({ example: 'smtp.gmail.com', description: 'SMTP host' })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiPropertyOptional({ example: 587, description: 'SMTP port' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional({ example: false, description: 'Use TLS/SSL' })
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'SMTP username',
  })
  @IsOptional()
  @IsString()
  user?: string;

  @ApiPropertyOptional({ example: 'password', description: 'SMTP password' })
  @IsOptional()
  @IsString()
  pass?: string;

  @ApiPropertyOptional({
    example: 'noreply@example.com',
    description: 'From email address',
  })
  @IsOptional()
  @IsString()
  fromEmail?: string;

  @ApiPropertyOptional({ example: 'My App', description: 'From name' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({
    example: 'SG.xxxxx',
    description: 'API key for SendGrid',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ example: true, description: 'Is this mailer active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
