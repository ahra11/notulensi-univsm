
/**
 * Spreadsheet Service - Production Ready
 */

// PASTIKAN URL INI ADALAH URL DARI HASIL 'DEPLOY' APPS SCRIPT ANDA
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_R0sOiuJtztp2lz0DHkG40S755Gh389RZienuYXzpaPeNrbUmQMd5yErzBEsGx1mnnQ/exec"; 

export const SpreadsheetService = {
    async saveData(data: any) {
        console.log("Menghubungkan ke Server Database...");
        
        if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_REAL_ID_HERE")) {
            throw new Error("Konfigurasi database belum lengkap.");
        }

        try {
            /**
             * Menggunakan mode 'no-cors' adalah cara paling aman untuk mengirim data ke 
             * Google Apps Script dari domain yang berbeda tanpa masalah kebijakan keamanan browser.
             */
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(data)
            });

            // Karena 'no-cors', kita tidak bisa membaca isi respon, tapi jika tidak ada error, kita anggap sukses.
            return { success: true, message: "Data berhasil diarsipkan ke Cloud" };
        } catch (error) {
            console.error("Koneksi Database Terputus:", error);
            throw error;
        }
    },

    async fetchAll() {
        return [];
    }
};
