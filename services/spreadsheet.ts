
/**
 * Spreadsheet Service - Enhanced CRUD
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_R0sOiuJtztp2lz0DHkG40S755Gh389RZienuYXzpaPeNrbUmQMd5yErzBEsGx1mnnQ/exec"; 

export const SpreadsheetService = {
    async saveData(data: any, action: 'create' | 'update' | 'delete' | 'verify' = 'create') {
        console.log(`Menjalankan aksi: ${action}...`);
        
        if (!WEB_APP_URL || WEB_APP_URL.includes("YOUR_REAL_ID_HERE")) {
            throw new Error("Konfigurasi database belum lengkap.");
        }

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ ...data, actionType: action })
            });

            return { success: true, message: `Aksi ${action} berhasil di Cloud` };
        } catch (error) {
            console.error("Koneksi Database Terputus:", error);
            throw error;
        }
    },

    async updateData(id: string, updates: any) {
        return this.saveData({ id, ...updates }, 'update');
    },

    async deleteData(id: string) {
        return this.saveData({ id }, 'delete');
    },

    async verifyMinute(id: string, verifierName: string) {
        return this.saveData({ 
            id, 
            signedBy: verifierName, 
            signedAt: new Date().toISOString(),
            status: 'SIGNED'
        }, 'verify');
    }
};
