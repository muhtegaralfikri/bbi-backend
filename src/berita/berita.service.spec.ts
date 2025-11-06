import { Test, TestingModule } from '@nestjs/testing';
import { BeritaService } from './berita.service';

describe('BeritaService', () => {
  let service: BeritaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeritaService],
    }).compile();

    service = module.get<BeritaService>(BeritaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
