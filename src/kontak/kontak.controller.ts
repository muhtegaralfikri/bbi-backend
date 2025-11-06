import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { KontakService } from './kontak.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateKontakDto } from 'src/common/dto';

@Controller('api')
export class KontakController {
  constructor(private readonly kontakService: KontakService) {}

  @ApiTags('Publik - Kontak')
  @Get('kontak')
  getKontak() {
    return this.kontakService.getKontak();
  }

  @ApiTags('Admin - CMS')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/kontak')
  updateKontak(@Body() updateKontakDto: UpdateKontakDto) {
    return this.kontakService.updateKontak(updateKontakDto);
  }
}