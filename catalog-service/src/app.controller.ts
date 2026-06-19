import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @MessagePattern('get_categories')
  async getCategories() {
    return this.appService.getCategories();
  }
  @MessagePattern('get_products')
  async getProducts(
    @Payload() data: { page: number; limit: number; category?: string; search?: string; sort?: string },
  ) {
    return this.appService.getProducts(data);
  }
  @MessagePattern('get_product_by_slug')
  async getProductBySlug(
    @Payload() data: { slug: string },
  ) {
    return this.appService.getProductBySlug(
      data.slug,
    );
  }
}