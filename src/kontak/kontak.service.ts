import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateKontakDto } from 'src/common/dto';

@Injectable()
export class KontakService {
  constructor(private prisma: PrismaService) {}

  // ID 1 adalah ID "singleton" untuk info perusahaan
  private readonly infoId = 1;

  async getKontak() {
    let info = await this.prisma.infoPerusahaan.findUnique({
      where: { id: this.infoId },
    });

    if (!info) {
      // Jika tabel kosong karena satu dan lain hal, buat data default
      // Ini adalah implementasi "self-healing"
      info = await this.prisma.infoPerusahaan.create({
        data: {
          id: this.infoId,
          alamat_kantor: 'PT Bosowa Bandar Indonesia',
          no_hp: '(0411) 123456',
          email: 'info@bbi.co.id',
          google_maps_embed: '<iframe src="..."></iframe>',
        },
      });
    }
    return info;
  }

  async updateKontak(dto: UpdateKontakDto) {
    // Menggunakan UPSERT (Update or Create) - Sesuai rekomendasi kita
    // Ini akan memperbarui ID 1, atau membuatnya jika tidak ada.
    return this.prisma.infoPerusahaan.upsert({
      where: { id: this.infoId },
      update: dto,
      create: {
        id: this.infoId,
        ...dto,
      },
    });
  }
}