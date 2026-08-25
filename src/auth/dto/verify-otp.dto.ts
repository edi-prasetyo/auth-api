import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the user',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code sent to email',
  })
  @IsString()
  @IsNotEmpty()
  otpCode!: string;
}
