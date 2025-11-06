import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { diskStorage } from 'multer'; // Untuk menyimpan ke disk

@ApiTags('Admin - CMS')
@Controller('api/admin')
export class UploadController {
  @Post('upload-image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data') // Menandakan ini adalah form data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file')) // 'file' adalah nama field
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    
    // --- PENTING ---
    // Ini adalah placeholder. Di sini Anda perlu logika untuk:
    // 1. Memvalidasi file (tipe, ukuran)
    // 2. Menyimpan file (mis. ke S3, GCS, Cloudinary, atau static folder)
    // 3. Mengembalikan URL publik dari file yang disimpan
    
    console.log(file);
    
    // Contoh respons (ganti dengan URL sebenarnya setelah di-upload)
    // Jika disimpan lokal, Anda perlu setup static file server
    return { 
      message: 'File berhasil di-upload',
      imageUrl: `/uploads/${file.filename}` 
    };
  }
}