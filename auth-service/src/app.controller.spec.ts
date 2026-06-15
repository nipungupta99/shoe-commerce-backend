import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';

describe('AppController', () => {
  let appController: AppController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {};
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('ping', () => {
    it('should return "Auth service alive"', () => {
      expect(appController.ping()).toEqual({ message: 'Auth service alive' });
    });
  });
});

