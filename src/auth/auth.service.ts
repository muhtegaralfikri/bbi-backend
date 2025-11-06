import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// DTOs akan kita buat di file terpisah
import { CreateAdminDto, LoginDto } from 'src/common/dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.admin.create({
      data: {
        nama_lengkap: dto.nama_lengkap,
        email: dto.email,
        password_hash,
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        created_at: true,
      },
    });
  }

  async validateAdmin(email: string, pass: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    if (admin && (await bcrypt.compare(pass, admin.password_hash))) {
      // Jangan kirim password hash ke client
      const { password_hash, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { email: admin.email, sub: admin.id };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        nama_lengkap: admin.nama_lengkap,
      },
    };
  }

  async forgotPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new NotFoundException('Admin tidak ditemukan');
    }
    // ... Logika untuk generate token unik (mis. crypto.randomBytes)
    const resetToken = 'TOKEN_ACAK_UNIK_DARI_CRYPTO'; 
    const resetTokenExpires = new Date(Date.now() + 3600000); // Berlaku 1 jam

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { reset_token: resetToken, reset_token_expires: resetTokenExpires },
    });

    // ... Logika untuk mengirim email (memerlukan @nestjs/mailer)
    // kirimEmail(admin.email, `Token reset: ${resetToken}`);
    console.log(`Mengirim reset token ke ${admin.email}: ${resetToken}`);
    return { message: 'Link reset password telah dikirim ke email Anda.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const admin = await this.prisma.admin.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gt: new Date() }, // Cek apakah token masih berlaku
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        password_hash,
        reset_token: null, // Hapus token setelah dipakai
        reset_token_expires: null,
      },
    });

    return { message: 'Password berhasil direset.' };
  }
}
