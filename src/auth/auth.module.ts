// import { Module } from '@nestjs/common';

// @Module({
//   imports: [],
//   controllers: [],
//   providers: [],
//   exports: [],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [PassportModule],
  providers: [GoogleStrategy],
})
export class AuthModule {}
