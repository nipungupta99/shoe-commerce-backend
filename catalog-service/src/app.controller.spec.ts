import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getCategories: jest.fn().mockResolvedValue([{ id: '1', name: 'Shoes' }]),
            getProducts: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      expect(await appController.getCategories()).toEqual([{ id: '1', name: 'Shoes' }]);
    });
  });
});

