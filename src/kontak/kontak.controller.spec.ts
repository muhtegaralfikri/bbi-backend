import { Test, TestingModule } from '@nestjs/testing';
import { KontakController } from './kontak.controller';

describe('KontakController', () => {
  let controller: KontakController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KontakController],
    }).compile();

    controller = module.get<KontakController>(KontakController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
