/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Integrasi Full CRUD untuk Notulensi dan Manajemen User
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_R0sOiuJtztp2lz0DHkG40S755Gh389RZienuYXzpaPeNrbUmQMd5yErzBEsGx1mnnQ/exec";

export const SpreadsheetService = {
    // ==========================================
    // BAGIAN 1: MANAJEMEN USER (Cloud Sync)
    // ==========================================

    async getUsers(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getUsers`);
            const data = await response.json();
            const users = data.users || [];
            localStorage.setItem('usm_users', JSON.stringify(users)); // Backup lokal
            return users;
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
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

    async fetchAllMinutes(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?actionType=read`); // Sesuaikan action di Apps Script
            const data = await response.json();
            const minutes = Array.isArray(data) ? data : [];
            localStorage.setItem('usm_minutes_cache', JSON.stringify(minutes));
            return minutes;
        } catch (error) {
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
        if (!WEB_APP_URL) throw new Error("URL Cloud belum dikonfigurasi.");

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Penting untuk Google Apps Script
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            // Sinkronisasi Cache Lokal secara Optimistik
            this.syncLocalCache(payload);
            
            return { success: true };
        } catch (error) {
            console.error("Cloud Sync Error:", error);
            throw error;
        }
    },

    syncLocalCache(payload: any) {
        // Logika sinkronisasi untuk Notulensi
        if (payload.actionType) {
            let local = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
            if (payload.actionType === 'create') local.unshift(payload);
            else if (payload.actionType === 'update' || payload.actionType === 'verify') {
                local = local.map((item: any) => item.id === payload.id ? { ...item, ...payload } : item);
            } else if (payload.actionType === 'delete') {
                local = local.filter((item: any) => item.id !== payload.id);
            }
            localStorage.setItem('usm_minutes_cache', JSON.stringify(local));
        }
        
        // Logika sinkronisasi untuk User (jika perlu update instan di UI)
        if (payload.action === 'updateUser' || payload.action === 'addUser') {
            // Pengambilan ulang data user biasanya lebih aman via fetch di UserManagement.tsx
        }
    }
};
