import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCabangDto, UpdateCabangDto } from 'src/common/dto';

@Injectable()
export class CabangService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.infoCabang.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const cabang = await this.prisma.infoCabang.findUnique({
      where: { id },
    });
    if (!cabang) {
      throw new NotFoundException(`Cabang with ID ${id} not found`);
    }
    return cabang;
  }

  async create(dto: CreateCabangDto) {
    return this.prisma.infoCabang.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCabangDto) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.infoCabang.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.infoCabang.delete({
      where: { id },
    });
  }
}
