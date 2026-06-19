import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async getCategories() {
    console.log("GET CATEGORIES");
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
  async getProducts(
    data: {
      page: number;
      limit: number;
      category?: string
      search?: string
      sort?: string
    },
  ) {
    const page = data.page || 1;
    const limit = data.limit || 10;

    const skip = (page - 1) * limit;

    const [products, total] =
      await Promise.all([
        this.prisma.product.findMany({
          where: {
            status: 'PUBLISHED',
            ...(data.category && {
              category: {
                slug: data.category,
              }
            }),
            ...(data.search && {
              OR: [
                {
                  name: {
                    contains: data.search,
                    mode: 'insensitive',
                  },
                },
                {
                  brand: {
                    contains: data?.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }),
          },
          orderBy:
            data?.sort === 'oldest'
              ? { createdAt: 'asc' }
              : { createdAt: 'desc' },
          skip,
          take: limit,

          include: {
            category: true,
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
            },

            variants: {
              select: {
                price: true,
                discountPrice: true,
              },
            },
          },
        }),

        this.prisma.product.count({
          where: {
            status: 'PUBLISHED',
          },
        }),
      ]);

    return {
      data: products,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit,
        ),
      },
    };
  }
  async getProductBySlug(
    slug: string,
  ) {
    return this.prisma.product.findUnique({
      where: {
        slug,
      },

      include: {
        category: true,

        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });
  }
}