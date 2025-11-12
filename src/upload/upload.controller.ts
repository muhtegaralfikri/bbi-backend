import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

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
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan dalam permintaan');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Hanya file gambar yang diperbolehkan');
    }

    const baseUrl =
      process.env.APP_BASE_URL ??
      `${req.protocol}://${req.get('host') ?? 'localhost:3001'}`;

    return {
      message: 'File berhasil di-upload',
      imageUrl: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
