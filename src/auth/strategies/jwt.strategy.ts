import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: any) {
    // The payload contains the data that was signed into the JWT.
    // We can return the payload, or an object that will be available in req.user
    // We should also fetch the user from the database here to ensure they still exist and are verified
    // For simplicity in this example, we'll just return the payload.
    // In a real app, you would use PrismaService to find the user by payload.userId and check their status.
    return { userId: payload.userId, email: payload.email };
  }
}
