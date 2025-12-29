import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CabangService } from './cabang.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCabangDto, UpdateCabangDto } from 'src/common/dto';

@Controller('api')
export class CabangController {
  constructor(private readonly cabangService: CabangService) {}

  // Public endpoint - get all branches
  @ApiTags('Publik - Cabang')
  @Get('cabang')
  findAllPublic() {
    return this.cabangService.findAll();
  }

  // Admin endpoints
  @ApiTags('Admin - Cabang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/cabang')
  findAll() {
    return this.cabangService.findAll();
  }

  @ApiTags('Admin - Cabang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/cabang/:id')
  findOne(@Param('id') id: string) {
    return this.cabangService.findOne(id);
  }

  @ApiTags('Admin - Cabang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/cabang')
  create(@Body() createCabangDto: CreateCabangDto) {
    return this.cabangService.create(createCabangDto);
  }

  @ApiTags('Admin - Cabang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/cabang/:id')
  update(@Param('id') id: string, @Body() updateCabangDto: UpdateCabangDto) {
    return this.cabangService.update(id, updateCabangDto);
  }

  @ApiTags('Admin - Cabang')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/cabang/:id')
  delete(@Param('id') id: string) {
    return this.cabangService.delete(id);
  }
}
