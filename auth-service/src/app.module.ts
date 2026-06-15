import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [AppController],
  providers: [PrismaService, AuthService],
})
export class AppModule { }