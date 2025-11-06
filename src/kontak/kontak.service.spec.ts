import { Test, TestingModule } from '@nestjs/testing';
import { KontakService } from './kontak.service';

describe('KontakService', () => {
  let service: KontakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KontakService],
    }).compile();

    service = module.get<KontakService>(KontakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
