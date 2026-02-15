/**
 * Spreadsheet Service - Universitas Sapta Mandiri
 * Sinkronisasi Online dengan Kontrol Pimpinan
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZTAAZKzaVH2kofzYfmg1W8aizdrqbIhrM_tAE1_Y4Ip6uOHpFWISEjX1FGv5gGEkVJQ/exec";

export const SpreadsheetService = {
    async fetchAll(): Promise<any[]> {
        return this.fetchAllMinutes();
    },

    async fetchAllMinutes(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?actionType=read&_t=${Date.now()}`);
            const data = await response.json();
            const minutes = Array.isArray(data) ? data : [];
            
            // VALIDASI STATUS: Mencegah status "SIGNED" palsu/otomatis
            const sanitizedMinutes = minutes.map(m => ({
                ...m,
                // Hanya tampilkan SIGNED jika kolom signedby di Spreadsheet sudah terisi resmi
                status: (m.status === 'SIGNED' && m.signedby) ? 'SIGNED' : 'DRAFT',
                title: String(m.title || ""),
            }));

            localStorage.setItem('usm_minutes_cache', JSON.stringify(sanitizedMinutes));
            return sanitizedMinutes;
        } catch (error) {
            const local = localStorage.getItem('usm_minutes_cache');
            return local ? JSON.parse(local) : [];
        }
    },

    async saveMinute(data: any) {
        // Data baru SELALU berstatus DRAFT sebelum disahkan Rektor
        const payload = { ...data, status: 'DRAFT', actionType: 'create' };
        return this.postToCloud(payload);
    },

    async verifyMinute(id: string, verifierName: string) {
        // HANYA fungsi ini yang bisa mengubah status menjadi SIGNED
        return this.postToCloud({ 
            id, 
            signedBy: verifierName, 
            signedAt: new Date().toLocaleString('id-ID'),
            status: 'SIGNED',
            actionType: 'verify'
        });
    },

    async postToCloud(payload: any) {
        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify(payload)
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
};
