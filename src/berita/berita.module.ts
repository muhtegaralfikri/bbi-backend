import { Module } from '@nestjs/common';
import { BeritaService } from './berita.service';
import { BeritaController } from './berita.controller';
// AuthModule tidak perlu di-import karena JwtAuthGuard
// akan tersedia berkat PassportModule yang di-register di AuthModule.
// PrismaModule sudah @Global.

@Module({
  controllers: [BeritaController],
  providers: [BeritaService],
})
export class BeritaModule {}
