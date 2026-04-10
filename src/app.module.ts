import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module'; // Import AuthModule
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule, // Add AuthModule here
    PrismaModule, // Ensure PrismaModule is also imported if not nested in AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
