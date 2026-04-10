import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Helper to generate OTP
  private async generateOtp(userId: bigint): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete existing OTP for the user
    await this.prisma.oTP.deleteMany({ where: { userId } });

    await this.prisma.oTP.create({
      data: {
        userId,
        code: otpCode,
        expiresAt: otpExpiry,
      },
    });

    return otpCode;
  }

  // Register user
  async register(registerDto: RegisterDto): Promise<any> {
    const { name, email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    const otp = await this.generateOtp(newUser.id);

    return {
      message: 'User registered successfully. Please check your email for OTP.',
      userId: newUser.id.toString(), // return string for frontend convenience
    };
  }

  // Verify OTP
  async verifyOtp(dto: VerifyOtpDto): Promise<any> {
    const userId = BigInt(dto.userId);
    const otpCode = dto.otpCode;

    const otpRecord = await this.prisma.oTP.findFirst({
      where: { userId, code: otpCode },
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP or user ID.');

    const now = new Date();
    if (otpRecord.expiresAt < now) {
      await this.prisma.oTP.delete({ where: { id: otpRecord.id } });
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    await this.prisma.oTP.delete({ where: { id: otpRecord.id } });

    return { message: 'OTP verified successfully. You can now log in.' };
  }

  // Login user
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials.');
    if (!user.isVerified) throw new UnauthorizedException('User not verified.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new UnauthorizedException('Invalid credentials.');

    const refreshTokenExpiry =
      this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 7776000;

    const accessToken = this.jwtService.sign(
      { userId: user.id.toString(), email: user.email },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn:
          this.configService.get<number>('JWT_ACCESS_EXPIRATION') || 900,
      },
    );

    const refreshTokenId = BigInt(Date.now()); // simple BigInt id for RefreshToken
    const refreshToken = this.jwtService.sign(
      { userId: user.id.toString(), jti: refreshTokenId.toString() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      },
    );

    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpiry * 1000,
    );

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // Refresh token
  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = dto.refreshToken;

    try {
      const decoded: any = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const userId = BigInt(decoded.userId);
      const tokenId = BigInt(decoded.jti);

      const dbToken = await this.prisma.refreshToken.findUnique({
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

      const newRefreshTokenId = BigInt(Date.now());
      const newRefreshToken = this.jwtService.sign(
        { userId: userId.toString(), jti: newRefreshTokenId.toString() },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 7776000,
        },
      );

      const newRefreshTokenExpiresAt = new Date(Date.now() + 7776000 * 1000);

      await this.prisma.refreshToken.deleteMany({ where: { userId } });
      await this.prisma.refreshToken.create({
        data: {
          id: newRefreshTokenId,
          token: newRefreshToken,
          userId,
          expiresAt: newRefreshTokenExpiresAt,
        },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  // Logout
  async logout(userIdStr: string, refreshToken: string) {
    const userId = BigInt(userIdStr);

    const deleted = await this.prisma.refreshToken.deleteMany({
      where: { userId, token: refreshToken },
    });

    if (deleted.count === 0)
      throw new BadRequestException(
        'Refresh token not found or already invalidated.',
      );

    return { message: 'Logout successful.' };
  }
}
