import { Body, Controller, Get, Inject, Post, UseGuards, Req, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    @Inject('CATALOG_SERVICE')
    private readonly catalogClient: ClientProxy,
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
  @Post('auth/refresh')
  async refresh(@Body() body: any) {
    return await firstValueFrom(
      this.authClient.send('refresh_token', body),
    );
  }
  @Post('auth/logout')
  async logout(@Body() body: any) {
    return await firstValueFrom(
      this.authClient.send(
        'logout_user',
        body,
      ),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Get('categories')
  async getCategories() {
    return await firstValueFrom(
      this.catalogClient.send(
        'get_categories',
        {},
      ),
    );
  }

  @Get('products')
  async getProducts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string
  ) {
    return await firstValueFrom(
      this.catalogClient.send(
        'get_products',
        { page: Number(page), limit: Number(limit), category, search },
      ),
    );
  }
  @Get('products/:slug')
  async getProductBySlug(
    @Param('slug') slug: string,
  ) {
    return await firstValueFrom(
      this.catalogClient.send(
        'get_product_by_slug',
        { slug },
      ),
    );
  }
}