/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Sinkronisasi Online dengan Kontrol Pimpinan
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzVLIHKp4RJG0Sh7zjgGMj_5DH1PX_d_CM-1wgrFmySb-WXepLcjgQ8ROtfXbWxeFddOg/exec";

export const SpreadsheetService = {
    // ==========================================
    // 1. MANAJEMEN NOTULENSI
    // ==========================================
    async fetchAll(): Promise<any[]> {
        return this.fetchAllMinutes();
    },

    async fetchAllMinutes(): Promise<any[]> {
        try {
            console.log("1. Mencoba menarik data Notulensi dari Cloud...");
            const response = await fetch(`${WEB_APP_URL}?actionType=read&_t=${Date.now()}`);
            const data = await response.json();
            
            console.log("2. Data mentah dari Google Sheets:", data);

            if (data.error) {
                console.error("3. Terjadi Error di server Google:", data.error);
                throw new Error(data.error);
            }

            const minutes = Array.isArray(data) ? data : [];
            
            const sanitizedMinutes = minutes.map((m, i) => ({
                ...m,
                id: m.id || `M-RECOVERY-${i}`, 
                status: (m.status === 'SIGNED' && (m.signedby || m.signedBy)) ? 'SIGNED' : 'DRAFT',
                title: String(m.title || "Tanpa Judul"),
            }));

            // ANTI-JEBOL CACHE
            try {
                const lightweightCache = sanitizedMinutes.map(m => {
                    const { documentation, ...rest } = m;
                    return { ...rest, documentation: [] };
                });
                localStorage.setItem('usm_minutes_cache', JSON.stringify(lightweightCache));
                console.log("4. Cache versi ringan berhasil disimpan.");
            } catch (cacheError) {
                console.warn("Peringatan: Memori lokal penuh.");
            }

            return sanitizedMinutes;
            
        } catch (error) {
            console.error("X. Gagal menarik Notulensi dari Cloud:", error);
            const local = localStorage.getItem('usm_minutes_cache');
            return local ? JSON.parse(local) : [];
        }
    },

    async saveMinute(data: any) {
        const payload = { ...data, status: 'DRAFT', actionType: 'create' };
        return this.postToCloud(payload);
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

    async deleteData(id: string) {
        return this.postToCloud({ id: id, actionType: 'delete' });
    },

    // ==========================================
    // 2. MANAJEMEN USER 
    // ==========================================
    async getUsers(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getUsers&_t=${Date.now()}`);
            const data = await response.json();
            const usersList = data.users && Array.isArray(data.users) ? data.users : [];
            localStorage.setItem('usm_users', JSON.stringify(usersList));
            return usersList;
        } catch (error) {
            const local = localStorage.getItem('usm_users');
            return local ? JSON.parse(local) : [];
        }
    },

    async addUser(user: any) {
        return this.postToCloud({ action: 'addUser', user: user });
    },

    async updateUser(id: string, userData: any) {
        return this.postToCloud({ action: 'updateUser', id: id, user: userData });
    },

    async deleteUser(id: string) {
        return this.postToCloud({ action: 'deleteUser', id: id });
    },

    // ==========================================
    // 3. FUNGSI PENGIRIMAN INTI
    // ==========================================
    async postToCloud(payload: any) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error("Gagal mengirim data ke Cloud:", error);
            throw error;
        }
    },

    // ==========================================
    // 4. MANAJEMEN JADWAL RAPAT
    // ==========================================
    async getSchedules(): Promise<any[]> {
        try {
            console.log("Menarik Jadwal Rapat...");
            const response = await fetch(`${WEB_APP_URL}?action=getSchedules&_t=${Date.now()}`);
            const data = await response.json();
            const schedulesList = data.schedules && Array.isArray(data.schedules) ? data.schedules : [];
            localStorage.setItem('usm_schedules', JSON.stringify(schedulesList));
            return schedulesList;
        } catch (error) {
            return JSON.parse(localStorage.getItem('usm_schedules') || '[]');
        }
    },

    async addSchedule(schedule: any) {
        return this.postToCloud({ action: 'addSchedule', schedule: schedule });
    },

    async deleteSchedule(id: string) {
        return this.postToCloud({ action: 'deleteSchedule', id: id });
    }
};
