import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import cloudinary from 'src/config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

@ApiTags('Admin - CMS')
@Controller('api/admin')
export class UploadController {
  @Post('upload-image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan dalam permintaan');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Hanya file gambar yang diperbolehkan');
    }

    if (!file.buffer) {
      throw new BadRequestException(
        'File buffer tidak tersedia, coba unggah ulang',
      );
    }

    const folder = process.env.CLOUDINARY_FOLDER ?? 'bbi/uploads';

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, response) => {
          if (error || !response) {
            return reject(
              new BadRequestException(
                error?.message ?? 'Gagal mengunggah gambar ke Cloudinary',
              ),
            );
          }
          resolve(response);
        },
      );

      upload.end(file.buffer);
    });

    return {
      message: 'File berhasil di-upload',
      imageUrl: result.secure_url,
      filename: result.public_id,
    };
  }
}
