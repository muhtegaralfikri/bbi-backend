import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      // Konfigurasi storage (bisa juga S3, dll)
      // Contoh simpan ke disk:
      // storage: diskStorage({
      //   destination: './public/uploads',
      //   filename: (req, file, cb) => {
      //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      //     cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
      //   }
      // })
      dest: './uploads', // Direktori sementara
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}