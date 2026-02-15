/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Deskripsi: Layanan integrasi Cloud dengan Google Sheets untuk sinkronisasi Online.
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZTAAZKzaVH2kofzYfmg1W8aizdrqbIhrM_tAE1_Y4Ip6uOHpFWISEjX1FGv5gGEkVJQ/exec";

export const SpreadsheetService = {
    // ==========================================
    // BAGIAN 1: MANAJEMEN USER (Cloud Sync)
    // ==========================================

    async getUsers(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getUsers&_t=${Date.now()}`);
            const data = await response.json();
            const users = data.users || [];
            localStorage.setItem('usm_users', JSON.stringify(users));
            return users;
        } catch (error) {
            console.error("Koneksi gagal, mengambil data user lokal...");
            return JSON.parse(localStorage.getItem('usm_users') || '[]');
        }
    },

    async addUser(user: any) {
        return this.postToCloud({ action: 'addUser', user });
    },

    async updateUser(id: string, user: any) {
        return this.postToCloud({ action: 'updateUser', id, user });
    },

    async deleteUser(id: string) {
        return this.postToCloud({ action: 'deleteUser', id });
    },

    // ==========================================
    // BAGIAN 2: MANAJEMEN NOTULENSI (Minutes)
    // ==========================================

    /** * PERBAIKAN: Menambahkan nama fungsi 'fetchAll' agar sinkron dengan error di Console 
     */
    async fetchAll(): Promise<any[]> {
        return this.fetchAllMinutes();
    },

    async fetchAllMinutes(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?actionType=read&_t=${Date.now()}`);
            const data = await response.json();
            
            // Memastikan data adalah array (ini kunci agar daftar notulensi muncul)
            const minutes = Array.isArray(data) ? data : [];
            
            localStorage.setItem('usm_minutes_cache', JSON.stringify(minutes));
            return minutes;
        } catch (error) {
            console.warn("Gagal sinkron cloud, menggunakan data offline.");
            const local = localStorage.getItem('usm_minutes_cache');
            return local ? JSON.parse(local) : [];
        }
    },

    async saveMinute(data: any) {
        return this.postToCloud({ ...data, actionType: 'create' });
    },

    async updateMinute(id: string, updates: any) {
        return this.postToCloud({ id, ...updates, actionType: 'update' });
    },

    async deleteMinute(id: string) {
        return this.postToCloud({ id, actionType: 'delete' });
    },

    async verifyMinute(id: string, verifierName: string) {
        return this.postToCloud({ 
            id, 
            signedBy: verifierName, 
            signedAt: new Date().toLocaleString('id-ID'),
            status: 'SIGNED',
            actionType: 'verify'
        });
    },

    // ==========================================
    // UTILITY: PRIVATE POST METHOD
    // ==========================================

    async postToCloud(payload: any) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify(payload)
            });

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
