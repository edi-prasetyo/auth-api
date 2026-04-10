import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyOtpDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  otpCode!: string;
}
