-- CreateTable
CREATE TABLE `komentar_berita` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isi` LONGTEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_at` DATETIME(3),
    `berita_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `komentar_berita_berita_id_idx` ON `komentar_berita`(`berita_id`);

-- AddForeignKey
ALTER TABLE `komentar_berita`
ADD CONSTRAINT `komentar_berita_berita_id_fkey`
FOREIGN KEY (`berita_id`) REFERENCES `berita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
