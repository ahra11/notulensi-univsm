
export enum MinutesStatus {
    SIGNED = 'SIGNED',
    FINALIZED = 'FINALIZED',
    DRAFT = 'DRAFT'
}

export interface Participant {
    id: string;
    name: string;
    role: string;
    avatar?: string;
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

export interface Minute {
    id: string;
    title: string;
    date: string;
    status: MinutesStatus;
    updatedAt: string;
    signedBy?: string;
    agenda?: string;
    content?: string[];
    documentation?: string[];
}

export type Page = 'dashboard' | 'history' | 'form' | 'detail' | 'profile' | 'login' | 'register';
