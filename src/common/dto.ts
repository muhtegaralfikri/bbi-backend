// Ini adalah file tunggal untuk semua DTOs
// (Dalam proyek besar, Anda bisa memecahnya per modul)

import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsIn,
  IsInt,
} from 'class-validator';

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

  @ApiProperty()
  @IsString()
  @IsUrl()
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
  @IsInt()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
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
