import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BeritaModule } from './berita/berita.module';    // <- TAMBAHKAN
import { KontakModule } from './kontak/kontak.module';    // <- TAMBAHKAN
import { UploadModule } from './upload/upload.module';    // <- TAMBAHKAN

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Untuk .env
    PrismaModule, // Modul database global
    AuthModule,
    BeritaModule, // <- TAMBAHKAN
    KontakModule, // <- TAMBAHKAN
    UploadModule, // <- TAMBAHKAN
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}