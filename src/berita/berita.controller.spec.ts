import { Test, TestingModule } from '@nestjs/testing';
import { BeritaController } from './berita.controller';

describe('BeritaController', () => {
  let controller: BeritaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeritaController],
    }).compile();

    controller = module.get<BeritaController>(BeritaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
