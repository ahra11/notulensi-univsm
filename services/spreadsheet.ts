const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbztz4qA2tEdqieMPHAOazMIo-5nGAQWVZoSW159zwDiSSaqxCx-Lmw-AyzzUcpp3o1gVg/exec";

export const SpreadsheetService = {
    async fetchAll(): Promise<any[]> {
        return this.fetchAllMinutes();
    },

    async fetchAllMinutes(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?actionType=read&_t=${Date.now()}`);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            // PERBAIKAN: Tangani Array langsung
            const minutes = Array.isArray(data) ? data : [];
            
            const sanitizedMinutes = minutes.map((m: any, i: number) => ({
                ...m,
                id: m.id || `M-RECOVERY-${i}`, 
                status: (m.status === 'SIGNED' && (m.signedby || m.signedBy)) ? 'SIGNED' : 'DRAFT',
                title: String(m.title || "Tanpa Judul"),
            }));

            try {
                const lightweightCache = sanitizedMinutes.map((m: any) => {
                    const { documentation, ...rest } = m;
                    return { ...rest, documentation: [] };
                });
                localStorage.setItem('usm_minutes_cache', JSON.stringify(lightweightCache));
            } catch (e) { console.warn("Memori lokal penuh."); }

            return sanitizedMinutes;
            
        } catch (error) {
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

    async getUsers(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getUsers&_t=${Date.now()}`);
            const data = await response.json();
            
            // PERBAIKAN BUG LOGIN FATAL DI SINI:
            // Google Script mengirimkan Array langsung, bukan { users: [...] }
            const usersList = Array.isArray(data) ? data : (data.users || []);
            
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

    async postToCloud(payload: any) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getSchedules(): Promise<any[]> {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getSchedules&_t=${Date.now()}`);
            const data = await response.json();
            
            // PERBAIKAN: Tangani array langsung untuk Jadwal
            const schedulesList = Array.isArray(data) ? data : (data.schedules || []);
            
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
