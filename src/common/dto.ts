// Ini adalah file tunggal untuk semua DTOs
// (Dalam proyek besar, Anda bisa memecahnya per modul)

import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Auth DTOs ---

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nama_lengkap: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

// --- Berita DTOs ---

export class CreateBeritaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  judul: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ringkasan: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  isi_konten: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  judul_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ringkasan_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isi_konten_en?: string;

  @ApiProperty({
    description:
      'URL gambar utama atau path relatif (misal /uploads/filename.jpg)',
  })
  @IsString()
  @IsNotEmpty()
  gambar_utama_url: string;

  @ApiProperty({ enum: ['draft', 'published'], required: false })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}

export class UpdateBeritaDto extends PartialType(CreateBeritaDto) {}

export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}


// --- Kontak DTO ---

export class UpdateKontakDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  alamat_kantor: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  no_hp: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  google_maps_embed: string;
}

// --- Komentar DTOs ---

export class CreateKomentarDto {
  @ApiProperty({ description: 'Nama yang ditampilkan bersama komentar' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ description: 'Email pengirim untuk keperluan moderasi' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Isi komentar publik' })
  @IsString()
  @IsNotEmpty()
  isi: string;
}

export class KomentarStatusQueryDto {
  @ApiProperty({
    required: false,
    enum: ['pending', 'approved', 'rejected'],
    description: 'Filter komentar berdasarkan status',
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';
}

export class UpdateKomentarStatusDto {
  @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}
