import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBeritaDto,
  UpdateBeritaDto,
  CreateKomentarDto,
} from 'src/common/dto';
const ENGLISH_FIELDS = ['judul_en', 'ringkasan_en', 'isi_konten_en'] as const;
type EnglishFieldKey = (typeof ENGLISH_FIELDS)[number];
type EnglishFieldMap = Partial<Record<EnglishFieldKey, string | null>>;
type KomentarStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class BeritaService {
  private readonly logger = new Logger(BeritaService.name);

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

  private extractEnglishFields(
    dto: Partial<Record<EnglishFieldKey, string | null | undefined>>,
  ): EnglishFieldMap {
    const result: EnglishFieldMap = {};
    for (const field of ENGLISH_FIELDS) {
      if (dto[field] !== undefined) {
        const raw = dto[field];
        if (typeof raw === 'string') {
          const trimmed = raw.trim();
          result[field] = trimmed.length > 0 ? trimmed : null;
        } else {
          result[field] = raw ?? null;
        }
      }
    }
    return result;
  }

  private async getPublishedBeritaOrThrow(slug: string) {
    const berita = await this.prisma.berita.findFirst({
      where: { slug, status: 'published' },
      select: { id: true },
    });
    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
    return berita;
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
        komentar: {
          where: { status: 'approved' },
          orderBy: { created_at: 'asc' },
          select: {
            id: true,
            nama: true,
            isi: true,
            created_at: true,
          },
        },
      },
    });
    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
    return berita;
  }

  // --- Rute Admin ---
  async findAllAdmin() {
    return await this.prisma.berita.findMany({
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

    const manualEnglish = this.extractEnglishFields(dto);
    const {
      judul_en: _judulEn,
      ringkasan_en: _ringkasanEn,
      isi_konten_en: _isiKontenEn,
      ...baseData
    } = dto;

    return this.prisma.berita.create({
      data: {
        ...baseData,
        ...manualEnglish,
        slug: slug,
        penulis_id: adminId,
        published_at: dto.status === 'published' ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateBeritaDto) {
    const existing = await this.prisma.berita.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    let slug: string | undefined = undefined;
    if (dto.judul) {
      slug = this.slugify(dto.judul);
      const slugOwner = await this.prisma.berita.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugOwner) {
        throw new ConflictException('Judul berita sudah ada, gunakan judul lain.');
      }
    }
    
    const { judul_en, ringkasan_en, isi_konten_en, ...restDto } = dto;
    const manualEnglish = this.extractEnglishFields({
      judul_en,
      ringkasan_en,
      isi_konten_en,
    });
    const data: any = { ...restDto, ...manualEnglish };
    if (slug) {
      data.slug = slug;
    }

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

  async getKomentarPublik(slug: string) {
    const berita = await this.getPublishedBeritaOrThrow(slug);
    return this.prisma.komentarBerita.findMany({
      where: { berita_id: berita.id, status: 'approved' },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        nama: true,
        isi: true,
        created_at: true,
      },
    });
  }

  async createKomentar(slug: string, dto: CreateKomentarDto) {
    const berita = await this.getPublishedBeritaOrThrow(slug);
    const nama = dto.nama.trim();
    const isi = dto.isi.trim();
    if (!nama || !isi) {
      throw new BadRequestException('Nama dan komentar wajib diisi.');
    }
    return this.prisma.komentarBerita.create({
      data: {
        berita_id: berita.id,
        nama,
        email: dto.email.trim().toLowerCase(),
        isi,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async findKomentarAdmin(status?: KomentarStatus) {
    return this.prisma.komentarBerita.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        berita: { select: { id: true, judul: true, slug: true } },
      },
    });
  }

  async updateKomentarStatus(id: string, status: KomentarStatus) {
    try {
      return await this.prisma.komentarBerita.update({
        where: { id },
        data: {
          status,
          approved_at: status === 'approved' ? new Date() : null,
        },
        include: {
          berita: { select: { id: true, judul: true, slug: true } },
        },
      });
    } catch (error) {
      throw new NotFoundException('Komentar tidak ditemukan');
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
