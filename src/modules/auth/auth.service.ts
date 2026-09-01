import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Otp } from '../users/entities/otp.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  private async generateOtp(userId: number): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpRepository.delete({ userId });
    await this.otpRepository.save({
      userId,
      code: otpCode,
      expiresAt: otpExpiry,
    });

    return otpCode;
  }

  async resendOtp(email: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    const otpCode = await this.generateOtp(user.id);

    // Send OTP to all available channels (email and/or WhatsApp)
    try {
      const sendPromises: Promise<void>[] = [];

      // Always try to send via email if user has email
      if (user.email) {
        sendPromises.push(
          this.notificationService
            .sendOtpEmail(user.email, otpCode)
            .catch((err) => {
              console.error('Failed to send OTP via email:', err);
            }),
        );
      }

      // Always try to send via WhatsApp if user has phone
      if (user.phone) {
        sendPromises.push(
          this.notificationService
            .sendOtpWhatsApp(user.phone, otpCode)
            .catch((err) => {
              console.error('Failed to send OTP via WhatsApp:', err);
            }),
        );
      }

      await Promise.all(sendPromises);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }

    return {
      message: 'OTP resent successfully',
      userId: user.id.toString(),
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const otpCode = await this.generateOtp(newUser.id);

    // Send OTP to all available channels (email and/or WhatsApp)
    // The system will skip a channel if:
    // - No active configuration exists for that channel
    // - User doesn't have the required contact info (email/phone)
    try {
      const sendPromises: Promise<void>[] = [];

      // Always try to send via email if user has email
      if (newUser.email) {
        sendPromises.push(
          this.notificationService
            .sendOtpEmail(newUser.email, otpCode)
            .catch((err) => {
              console.error('Failed to send OTP via email:', err);
            }),
        );
      }

      // Always try to send via WhatsApp if user has phone
      if (newUser.phone) {
        sendPromises.push(
          this.notificationService
            .sendOtpWhatsApp(newUser.phone, otpCode)
            .catch((err) => {
              console.error('Failed to send OTP via WhatsApp:', err);
            }),
        );
      }

      await Promise.all(sendPromises);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }

    return {
      message: 'User registered successfully. Please check your email for OTP.',
      userId: newUser.id.toString(),
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<any> {
    const userId = parseInt(dto.userId, 10);
    const otpCode = dto.otpCode;

    const otpRecord = await this.otpRepository.findOne({
      where: { userId, code: otpCode },
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP or user ID.');

    const now = new Date();
    if (otpRecord.expiresAt < now) {
      await this.otpRepository.delete(otpRecord.id);
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    await this.userRepository.update(userId, { isVerified: true });
    await this.otpRepository.delete(otpRecord.id);

    return { message: 'OTP verified successfully. You can now log in.' };
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      name: string;
      phone: string;
    };
  }> {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User not verified.');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const refreshTokenExpiry =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 7776000;

    const accessToken = this.jwtService.sign(
      {
        userId: user.id.toString(),
        email: user.email,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn:
          this.configService.get<number>('JWT_ACCESS_EXPIRATION') || 900,
      },
    );

    const refreshTokenId = Date.now();

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id.toString(),
        jti: refreshTokenId.toString(),
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      },
    );

    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpiry * 1000,
    );

    await this.refreshTokenRepository.delete({
      userId: user.id,
    });

    await this.refreshTokenRepository.save({
      id: refreshTokenId,
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    if (!user.email || !user.phone) {
      throw new UnauthorizedException('User email is required.');
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    };
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = dto.refreshToken;

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const userId = parseInt(decoded.userId, 10);
      const tokenId = parseInt(decoded.jti, 10);

      const dbToken = await this.refreshTokenRepository.findOne({
        where: { id: tokenId },
      });
      if (!dbToken || new Date() > dbToken.expiresAt)
        throw new UnauthorizedException('Invalid or expired refresh token.');

      const newAccessToken = this.jwtService.sign(
        { userId: userId.toString(), email: decoded.email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn:
            this.configService.get<number>('JWT_ACCESS_EXPIRATION') || 900,
        },
      );

      const newRefreshTokenId = Date.now();
      const newRefreshToken = this.jwtService.sign(
        { userId: userId.toString(), jti: newRefreshTokenId.toString() },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 7776000,
        },
      );

      const newRefreshTokenExpiresAt = new Date(Date.now() + 7776000 * 1000);

      await this.refreshTokenRepository.delete({ userId });
      await this.refreshTokenRepository.save({
        id: newRefreshTokenId,
        token: newRefreshToken,
        userId,
        expiresAt: newRefreshTokenExpiresAt,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(
    userId: number,
    refreshToken: string,
  ): Promise<{ message: string }> {
    const result = await this.refreshTokenRepository.delete({
      userId,
      token: refreshToken,
    });

    if (result.affected === 0)
      throw new BadRequestException(
        'Refresh token not found or already invalidated.',
      );

    return { message: 'Logout successful.' };
  }
}
