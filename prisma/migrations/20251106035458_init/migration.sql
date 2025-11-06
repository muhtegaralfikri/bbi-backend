-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "isi_konten" TEXT NOT NULL,
    "gambar_utama_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "penulis_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galeri_berita" (
    "id" TEXT NOT NULL,
    "gambar_url" TEXT NOT NULL,
    "keterangan" TEXT,
    "berita_id" TEXT NOT NULL,

    CONSTRAINT "galeri_berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "info_perusahaan" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "alamat_kantor" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "google_maps_embed" TEXT NOT NULL,

    CONSTRAINT "info_perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_penulis_id_fkey" FOREIGN KEY ("penulis_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galeri_berita" ADD CONSTRAINT "galeri_berita_berita_id_fkey" FOREIGN KEY ("berita_id") REFERENCES "berita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
