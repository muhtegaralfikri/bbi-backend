import { Module } from '@nestjs/common';
import { KontakService } from './kontak.service';
import { KontakController } from './kontak.controller';

@Module({
  controllers: [KontakController],
  providers: [KontakService],
})
export class KontakModule {}