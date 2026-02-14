
/**
 * Spreadsheet Service - Full CRUD Integration
 * Menghubungkan aplikasi dengan Google Apps Script sebagai Backend
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_R0sOiuJtztp2lz0DHkG40S755Gh389RZienuYXzpaPeNrbUmQMd5yErzBEsGx1mnnQ/exec"; 

export const SpreadsheetService = {
    // Fungsi untuk mengambil semua data (Read)
    async fetchAll(): Promise<any[]> {
        if (!WEB_APP_URL) return [];
        try {
            const response = await fetch(WEB_APP_URL);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Gagal mengambil data dari cloud:", error);
            // Jika gagal, coba ambil dari local storage sebagai backup offline
            const local = localStorage.getItem('usm_minutes_cache');
            return local ? JSON.parse(local) : [];
        }
    },

    // Fungsi utama untuk operasi POST (Create, Update, Delete, Verify)
    async executeAction(data: any, action: 'create' | 'update' | 'delete' | 'verify') {
        if (!WEB_APP_URL) {
            throw new Error("Konfigurasi database belum lengkap.");
        }

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script memerlukan mode ini untuk POST lintas asal
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ ...data, actionType: action })
            });

            // Optimistic update: Simpan di cache lokal untuk kecepatan UI
            this.syncLocalCache(data, action);
            
            return { success: true };
        } catch (error) {
            console.error(`Gagal mengeksekusi aksi ${action}:`, error);
            throw error;
        }
    },

    syncLocalCache(data: any, action: string) {
        let local = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
        if (action === 'create') {
            local.unshift(data);
        } else if (action === 'update' || action === 'verify') {
            local = local.map((item: any) => item.id === data.id ? { ...item, ...data } : item);
        } else if (action === 'delete') {
            local = local.filter((item: any) => item.id !== data.id);
        }
        localStorage.setItem('usm_minutes_cache', JSON.stringify(local));
    },

    async saveData(data: any) {
        return this.executeAction(data, 'create');
    },

    async updateData(id: string, updates: any) {
        return this.executeAction({ id, ...updates }, 'update');
    },

    async deleteData(id: string) {
        return this.executeAction({ id }, 'delete');
    },

    async verifyMinute(id: string, verifierName: string) {
        return this.executeAction({ 
            id, 
            signedBy: verifierName, 
            signedAt: new Date().toLocaleString('id-ID'),
            status: 'SIGNED'
        }, 'verify');
    }
};
