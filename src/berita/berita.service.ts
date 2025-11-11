import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBeritaDto, UpdateBeritaDto } from 'src/common/dto';
import { TranslationService } from 'src/common/translation.service';

@Injectable()
export class BeritaService {
  private readonly logger = new Logger(BeritaService.name);

  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

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

  private async generateEnglishFields(content: {
    judul: string;
    ringkasan: string;
    isi_konten: string;
  }) {
    const [judul_en, ringkasan_en, isi_konten_en] = await Promise.all([
      this.translationService.translateText(content.judul, 'en'),
      this.translationService.translateText(content.ringkasan, 'en'),
      this.translationService.translateText(content.isi_konten, 'en', 'html'),
    ]);

    return { judul_en, ringkasan_en, isi_konten_en };
  }

  private async ensureEnglishFields<T extends any>(
    berita: T & {
      id: string;
      status: string;
      judul: string;
      ringkasan: string;
      isi_konten: string;
      judul_en?: string | null;
      ringkasan_en?: string | null;
      isi_konten_en?: string | null;
    },
  ): Promise<T> {
    if (
      berita.status !== 'published' ||
      (berita.judul_en && berita.ringkasan_en && berita.isi_konten_en)
    ) {
      return berita;
    }

    try {
      const englishFields = await this.generateEnglishFields(berita);
      await this.prisma.berita.update({
        where: { id: berita.id },
        data: englishFields,
      });
      return { ...berita, ...englishFields } as T;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown translation error';
      this.logger.warn(
        `Failed to update English fields for berita ${berita.id}: ${message}`,
      );
      return berita;
    }
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

    const enriched = await Promise.all(
      berita.map((item) => this.ensureEnglishFields(item)),
    );

    return {
      data: enriched,
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
    return await this.ensureEnglishFields(berita);
  }

  // --- Rute Admin ---
  async findAllAdmin() {
    const items = await this.prisma.berita.findMany({
      orderBy: { created_at: 'desc' },
      include: { penulis: { select: { nama_lengkap: true } } },
    });
    return await Promise.all(
      items.map((item) => this.ensureEnglishFields(item)),
    );
  }

  async findOneAdmin(id: string) {
    const berita = await this.prisma.berita.findUnique({ where: { id } });
    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }
    if (berita.status !== 'published') {
      return berita;
    }
    return await this.ensureEnglishFields(berita);
  }

  async create(dto: CreateBeritaDto, adminId: string) {
    const slug = this.slugify(dto.judul);
    // Cek duplikat slug
    const existing = await this.prisma.berita.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Judul berita sudah ada, gunakan judul lain.');
    }

    let englishFields = {};
    if (dto.status === 'published') {
      englishFields = await this.generateEnglishFields(dto);
    }

    return this.prisma.berita.create({
      data: {
        ...dto,
        ...englishFields,
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
    
    // Siapkan data untuk update
    const data: any = { ...dto };
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

    const targetStatus = dto.status ?? existing.status;
    const contentChanged = Boolean(
      dto.judul ?? dto.ringkasan ?? dto.isi_konten,
    );
    const missingEnglish =
      !existing.judul_en ||
      !existing.ringkasan_en ||
      !existing.isi_konten_en;

    if (targetStatus === 'published' && (contentChanged || missingEnglish)) {
      const englishFields = await this.generateEnglishFields({
        judul: dto.judul ?? existing.judul,
        ringkasan: dto.ringkasan ?? existing.ringkasan,
        isi_konten: dto.isi_konten ?? existing.isi_konten,
      });
      Object.assign(data, englishFields);
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
