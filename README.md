
# 🏛️ SiNotulen UNIVSM - Portal Notulensi Digital

Sistem manajemen notulensi rapat Universitas Sapta Mandiri berbasis web yang terintegrasi dengan Google Sheets dan Kecerdasan Buatan (Gemini AI).

## 🚀 Fitur Integrasi Google Meet (Baru!)

Aplikasi ini sekarang mendukung koordinasi rapat virtual secara langsung:
1. **Akses Dashboard:** Gunakan tombol "Gabung Rapat" untuk membuka Google Meet secara instan. Sistem akan mencoba mencocokkan identitas email Anda.
2. **Dokumentasi Tautan:** Notulis dapat memasukkan tautan Google Meet khusus ke dalam form notulensi rapat.
3. **Akses Peserta:** Peserta lain dapat membuka kembali tautan rapat tersebut melalui halaman "Detail Dokumen" di kemudian hari.

## 🚀 Cara Mengonlinekan (Deployment)

### Langkah 1: Persiapan Lokal
1. Buat folder baru di komputer Anda (misal: `notulensi-univsm`).
2. Buat file-file yang ada di proyek ini (salin isi kodenya satu per satu).

### Langkah 2: Upload ke GitHub
1. Masuk ke [GitHub](https://github.com).
2. Klik **New Repository**, beri nama `notulensi-univsm`, lalu klik **Create**.
3. Push kode Anda ke repository tersebut.

### Langkah 3: Deploy ke Vercel
1. Masuk ke [Vercel.com](https://vercel.com) menggunakan akun GitHub.
2. Klik **Add New** > **Project**.
3. Pilih repository `notulensi-univsm`.
4. **PENTING:** Klik bagian "Environment Variables" dan masukkan:
   - Key: `API_KEY`
   - Value: (Kunci API Gemini Anda dari Google AI Studio)
5. Klik **Deploy**.

## 🛠️ Teknologi
- **Frontend:** React 19, Tailwind CSS
- **AI:** Google Gemini API (Transkripsi, Ringkasan, Formating)
- **Database:** Google Apps Script + Google Sheets
- **Meeting:** Google Meet Integration
