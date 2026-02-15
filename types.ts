export enum MinutesStatus {
    SIGNED = 'SIGNED',
    FINALIZED = 'FINALIZED',
    DRAFT = 'DRAFT'
}

// Tambahan: Definisi Role untuk RBAC (Role-Based Access Control)
export type UserRole = 'SUPER_ADMIN' | 'PIMPINAN' | 'SEKRETARIS' | 'STAF';

export interface Participant {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

// Perbaikan: Interface User untuk login dan manajemen pengguna
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole; // Menggunakan tipe UserRole di atas
    nip?: string;
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'online' | 'offline';
    participants: Participant[];
}

// Tambahan: Interface Schedule untuk fitur buat jadwal rapat
export interface Schedule {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    agenda: string;
    status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
    createdBy: string; // Menyimpan ID User pembuat jadwal
}

export interface Minute {
    id: string;
    title: string;
    date: string;
    location?: string;
    status: MinutesStatus;
    updatedAt: string;
    signedBy?: string;
    signedAt?: string;
    agenda?: string;
    content?: string;
    documentation?: string[];
    submittedBy?: string;
    meetLink?: string;
}

// Perbaikan: Tambahkan 'users' ke dalam Page jika Anda ingin membuat halaman manajemen user terpisah
export type Page = 'dashboard' | 'history' | 'form' | 'detail' | 'profile' | 'login' | 'register' | 'reports' | 'users' | 'schedules';
