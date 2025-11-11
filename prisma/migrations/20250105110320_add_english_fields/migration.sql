-- Add English translation columns for news content
ALTER TABLE "berita"
ADD COLUMN "judul_en" TEXT,
ADD COLUMN "ringkasan_en" TEXT,
ADD COLUMN "isi_konten_en" TEXT;
