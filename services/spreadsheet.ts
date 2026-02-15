/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Optimasi: Menambahkan Cache-Buster agar data Online selalu segar
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_R0sOiuJtztp2lz0DHkG40S755Gh389RZienuYXzpaPeNrbUmQMd5yErzBEsGx1mnnQ/exec";

export const SpreadsheetService = {
    // ==========================================
    // BAGIAN 1: MANAJEMEN USER
    // ==========================================

    async getUsers(): Promise<any[]> {
        try {
            // Tambahkan timestamp (?t=...) agar browser tidak mengambil data lama (cache)
            const response = await fetch(`${WEB_APP_URL}?action=getUsers&t=${Date.now()}`);
            const data = await response.json();
            const users = data.users || [];
            localStorage.setItem('usm_users', JSON.stringify(users));
            return users;
        } catch (error) {
            console.error("Gagal ambil data user:", error);
            return JSON.parse(localStorage.getItem('usm_users') || '[]');
        }
    },

    async addUser(user: any) {
        return this.postToCloud({ action: 'addUser', user });
    },

    // ==========================================
    // BAGIAN 2: MANAJEMEN NOTULENSI
    // ==========================================

    async fetchAllMinutes(): Promise<any[]> {
        try {
            // PAKSA ambil data terbaru dengan actionType=read
            const response = await fetch(`${WEB_APP_URL}?actionType=read&t=${Date.now()}`);
            
            if (!response.ok) throw new Error("Server tidak merespon");
            
            const data = await response.json();
            
            // Validasi apakah data yang datang benar-benar Array
            const minutes = Array.isArray(data) ? data : [];
            
            // Simpan ke cache untuk backup offline
            localStorage.setItem('usm_minutes_cache', JSON.stringify(minutes));
            return minutes;
        } catch (error) {
            console.warn("Mode Offline: Mengambil data dari memori lokal.");
            const local = localStorage.getItem('usm_minutes_cache');
            return local ? JSON.parse(local) : [];
        }
    },

    async saveMinute(data: any) {
        // Pastikan data dikirim dengan actionType 'create'
        return this.postToCloud({ ...data, actionType: 'create' });
    },

    // ==========================================
    // UTILITY: PRIVATE POST METHOD
    // ==========================================

    async postToCloud(payload: any) {
        if (!WEB_APP_URL) throw new Error("URL Cloud belum dikonfigurasi.");

        try {
            // Gunakan mode: 'cors' jika memungkinkan, tapi 'no-cors' adalah standar Apps Script
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, // Google Apps Script lebih suka text/plain
                body: JSON.stringify(payload)
            });

            // Sinkronisasi lokal instan agar user langsung melihat perubahan
            this.syncLocalCache(payload);
            
            return { success: true };
        } catch (error) {
            console.error("Cloud Sync Error:", error);
            throw error;
        }
    },

    syncLocalCache(payload: any) {
        if (payload.actionType) {
            let local = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
            if (payload.actionType === 'create') {
                // Tambahkan data baru di posisi paling atas
                local = [payload, ...local];
            } else if (payload.actionType === 'update' || payload.actionType === 'verify') {
                local = local.map((item: any) => item.id === payload.id ? { ...item, ...payload } : item);
            } else if (payload.actionType === 'delete') {
                local = local.filter((item: any) => item.id !== payload.id);
            }
            localStorage.setItem('usm_minutes_cache', JSON.stringify(local));
        }
    }
};
