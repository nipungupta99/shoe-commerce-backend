import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) { }

  @Get('ping-auth')
  async pingAuth() {
    return await firstValueFrom(
      this.authClient.send('ping_auth', {}),
    );
  }

  @Post('auth/register')
  async register(@Body() body: any) {
    return await firstValueFrom(
      this.authClient.send('register_user', body),
    );
  }
  @Post('auth/login')
  async login(@Body() body: any) {
    return await firstValueFrom(
      this.authClient.send('login_user', body),
    );
  }
}