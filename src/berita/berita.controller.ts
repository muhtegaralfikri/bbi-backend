import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BeritaService } from './berita.service';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateBeritaDto,
  UpdateBeritaDto,
  PaginationQueryDto,
} from 'src/common/dto';

@Controller('api')
export class BeritaController {
  constructor(private readonly beritaService: BeritaService) {}

  /*
   * ======================================
   * RUTE PUBLIK (Tanpa Autentikasi)
   * ======================================
   */

  @ApiTags('Publik - Berita')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @Get('berita')
  findAllPublic(@Query() pagination: PaginationQueryDto) {
    return this.beritaService.findAllPublic(
      pagination.page,
      pagination.limit,
    );
  }

  @ApiTags('Publik - Berita')
  @Get('berita/:slug')
  findOnePublic(@Param('slug') slug: string) {
    return this.beritaService.findOnePublic(slug);
  }

  /*
   * ======================================
   * RUTE ADMIN (Wajib Autentikasi)
   * ======================================
   */

  @ApiTags('Admin - CMS')
  @ApiBearerAuth() // Menandakan perlu JWT
  @UseGuards(JwtAuthGuard)
  @Get('admin/berita')
  findAllAdmin() {
    return this.beritaService.findAllAdmin();
  }

  @ApiTags('Admin - CMS')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/berita/:id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.beritaService.findOneAdmin(id);
  }

  @ApiTags('Admin - CMS')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/berita')
  create(@Body() createBeritaDto: CreateBeritaDto, @Request() req) {
    const adminId = req.user.userId; // Ambil ID dari payload JWT
    return this.beritaService.create(createBeritaDto, adminId);
  }

  @ApiTags('Admin - CMS')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/berita/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBeritaDto: UpdateBeritaDto,
  ) {
    return this.beritaService.update(id, updateBeritaDto);
  }

  @ApiTags('Admin - CMS')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/berita/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beritaService.remove(id);
  }
}