import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BeritaModule } from './berita/berita.module';
import { KontakModule } from './kontak/kontak.module';
import { UploadModule } from './upload/upload.module';
import { CabangModule } from './cabang/cabang.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BeritaModule,
    KontakModule,
    UploadModule,
    CabangModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}