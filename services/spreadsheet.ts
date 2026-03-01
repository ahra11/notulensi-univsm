/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Sinkronisasi Online dengan Kontrol Pimpinan
 */

// URL Web App Bapak (Jangan diubah, ini sudah benar)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyZQClI0--BMZZgKrN_62KvpB8HZJgZabvssLYkuSnJ8bPiiP4LlriHSwFeRcy-DmgvKQ/exec";

export const SpreadsheetService = {
    // ==========================================
    // 1. MANAJEMEN NOTULENSI
    // ==========================================
    async fetchAll(): Promise<any[]> {
        return this.fetchAllMinutes();
    },

    async fetchAllMinutes(): Promise<any[]> {
        try {
            console.log("Mencoba menarik data Notulensi dari Cloud...");
            const response = await fetch(`${WEB_APP_URL}?actionType=read&_t=${Date.now()}`);
            const data = await response.json();
            const minutes = Array.isArray(data) ? data : [];
            
            // VALIDASI STATUS: Mencegah status "SIGNED" palsu
            const sanitizedMinutes = minutes.map(m => ({
                ...m,
                status: (m.status === 'SIGNED' && (m.signedby || m.signedBy)) ? 'SIGNED' : 'DRAFT',
                title: String(m.title || ""),
            }));

            localStorage.setItem('usm_minutes_cache', JSON.stringify(sanitizedMinutes));
            console.log("Berhasil menarik Notulensi:", sanitizedMinutes);
            return sanitizedMinutes;
        } catch (error) {
            console.error("Gagal menarik Notulensi dari Cloud:", error);
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
        console.log(`Menghapus data dengan ID: ${id}`);
        return this.postToCloud({ 
            id: id, 
            actionType: 'delete' 
        });
    },

    // ==========================================
    // 2. MANAJEMEN USER 
    // ==========================================
    async getUsers(): Promise<any[]> {
        try {
            console.log("Mencoba menarik data User dari Cloud...");
            const response = await fetch(`${WEB_APP_URL}?action=getUsers&_t=${Date.now()}`);
            const data = await response.json();
            
            const usersList = data.users && Array.isArray(data.users) ? data.users : [];
            
            localStorage.setItem('usm_users', JSON.stringify(usersList));
            console.log("Berhasil menarik User:", usersList);
            return usersList;
        } catch (error) {
            console.error("Gagal menarik User dari Cloud:", error);
            const local = localStorage.getItem('usm_users');
            return local ? JSON.parse(local) : [];
        }
    },

    async addUser(user: any) {
        const payload = { action: 'addUser', user: user };
        return this.postToCloud(payload);
    },

    // DUA FUNGSI INI WAJIB ADA AGAR SUPER ADMIN BISA EDIT & HAPUS AKUN
    async updateUser(id: string, userData: any) {
        const payload = { action: 'updateUser', id: id, user: userData };
        return this.postToCloud(payload);
    },

    async deleteUser(id: string) {
        const payload = { action: 'deleteUser', id: id };
        return this.postToCloud(payload);
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
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Gagal mengirim data ke Cloud:", error);
            throw error;
        }
    }
};
