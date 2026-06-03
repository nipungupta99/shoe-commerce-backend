import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth/auth.service';
import { RegisterDto } from './auth/dto/register.dto';
import { LoginDto } from './auth/dto/login.dto';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern('ping_auth')
  ping() {
    return {
      message: 'Auth service alive',
    };
  }

  @MessagePattern('register_user')
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(data);
  }
  @MessagePattern('login_user')
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }
}