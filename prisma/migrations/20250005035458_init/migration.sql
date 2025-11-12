-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `reset_token` VARCHAR(191),
    `reset_token_expires` DATETIME(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `ringkasan` LONGTEXT NOT NULL,
    `isi_konten` LONGTEXT NOT NULL,
    `gambar_utama_url` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `published_at` DATETIME(3),
    `penulis_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `galeri_berita` (
    `id` VARCHAR(191) NOT NULL,
    `gambar_url` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191),
    `berita_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `info_perusahaan` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `alamat_kantor` LONGTEXT NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `google_maps_embed` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `admins_email_key` ON `admins`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `berita_slug_key` ON `berita`(`slug`);

-- AddForeignKey
ALTER TABLE `berita` ADD CONSTRAINT `berita_penulis_id_fkey` FOREIGN KEY (`penulis_id`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `galeri_berita` ADD CONSTRAINT `galeri_berita_berita_id_fkey` FOREIGN KEY (`berita_id`) REFERENCES `berita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
