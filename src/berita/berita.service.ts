import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBeritaDto, UpdateBeritaDto } from 'src/common/dto';

@Injectable()
export class BeritaService {
  constructor(private prisma: PrismaService) {}

  // Fungsi utilitas pribadi untuk membuat slug
  private slugify(text: string): string {
    const a = 'àáäâãèéëêìíïîòóöôõùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
    const b = 'aaaaaeeeeiiiiooooouuuuncsyoarsnpwgnmuxzh------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Ganti spasi dengan -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Ganti karakter spesial
      .replace(/&/g, '-and-') // Ganti & dengan 'and'
      .replace(/[^\w\-]+/g, '') // Hapus karakter non-word
      .replace(/\-\-+/g, '-') // Ganti -- dengan -
      .replace(/^-+/, '') // Trim - dari awal
      .replace(/-+$/, ''); // Trim - dari akhir
  }

  // --- Rute Publik ---
  async findAllPublic(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [berita, total] = await this.prisma.$transaction([
      this.prisma.berita.findMany({
        where: { status: 'published' },
        skip,
        take: limit,
        orderBy: { published_at: 'desc' },
        include: { penulis: { select: { nama_lengkap: true } } },
      }),
      this.prisma.berita.count({ where: { status: 'published' } }),
    ]);

    return {
      data: berita,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOnePublic(slug: string) {
    const berita = await this.prisma.berita.findUnique({
      where: { slug, status: 'published' },
      include: {
        penulis: { select: { nama_lengkap: true } },
        galeri: true, // Sertakan galeri berita
      },
    });
    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
    return berita;
  }

  // --- Rute Admin ---
  async findAllAdmin() {
    return this.prisma.berita.findMany({
      orderBy: { created_at: 'desc' },
      include: { penulis: { select: { nama_lengkap: true } } },
    });
  }

  async findOneAdmin(id: string) {
    const berita = await this.prisma.berita.findUnique({ where: { id } });
    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
    return berita;
  }

  async create(dto: CreateBeritaDto, adminId: string) {
    const slug = this.slugify(dto.judul);
    // Cek duplikat slug
    const existing = await this.prisma.berita.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Judul berita sudah ada, gunakan judul lain.');
    }

    return this.prisma.berita.create({
      data: {
        ...dto,
        slug: slug,
        penulis_id: adminId,
        published_at: dto.status === 'published' ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateBeritaDto) {
    let slug: string | undefined = undefined;
    if (dto.judul) {
      slug = this.slugify(dto.judul);
      const existing = await this.prisma.berita.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Judul berita sudah ada, gunakan judul lain.');
      }
    }
    
    // Siapkan data untuk update
    const data: any = { ...dto, slug };

    // Logika untuk tanggal publikasi
    if (dto.status) {
      if (dto.status === 'published') {
        // Jika diubah jadi published, set tanggalnya
        data.published_at = new Date();
      } else if (dto.status === 'draft') {
        // Jika diubah jadi draft, hapus tanggalnya
        data.published_at = null;
      }
    }

    try {
      return await this.prisma.berita.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
  }

  async remove(id: string) {
    try {
      // GaleriBerita akan terhapus otomatis karena `onDelete: Cascade`
      return await this.prisma.berita.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
  }
}