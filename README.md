
# 🏛️ SiNotulen UNIVSM - Portal Notulensi Digital

Sistem manajemen notulensi rapat Universitas Sapta Mandiri berbasis web yang terintegrasi dengan Google Sheets dan Kecerdasan Buatan (Gemini AI).

## 🚀 Cara Mengonlinekan (Deployment)

### Langkah 1: Persiapan Lokal
1. Buat folder baru di komputer Anda (misal: `notulensi-univsm`).
2. Buat file-file yang ada di proyek ini (salin isi kodenya satu per satu):
   - `index.html`
   - `index.tsx`
   - `App.tsx`
   - `types.ts`
   - `metadata.json`
   - `package.json`
   - `tsconfig.json`
   - Folder `pages/` (isi dengan file .tsx terkait)
   - Folder `components/` (isi dengan file .tsx terkait)
   - Folder `services/` (isi dengan `spreadsheet.ts`)

### Langkah 2: Upload ke GitHub
1. Masuk ke [GitHub](https://github.com).
2. Klik **New Repository**, beri nama `notulensi-univsm`, lalu klik **Create**.
3. Di komputer Anda, jika sudah ada Git, jalankan di terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/notulensi-univsm.git
   git push -u origin main
   ```
   *Atau gunakan aplikasi **GitHub Desktop** untuk cara yang lebih mudah (Drag & Drop).*

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
- **AI:** Google Gemini API (untuk Transkripsi & Ringkasan)
- **Database:** Google Apps Script + Google Sheets
- **Hosting:** Vercel / Netlify
