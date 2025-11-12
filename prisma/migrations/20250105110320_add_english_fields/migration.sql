-- Add English translation columns for news content
ALTER TABLE `berita`
ADD COLUMN `judul_en` VARCHAR(191),
ADD COLUMN `ringkasan_en` LONGTEXT,
ADD COLUMN `isi_konten_en` LONGTEXT;
