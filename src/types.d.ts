import { Connection } from "mongoose"

declare global {
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    }
}

export interface AppUser {
    id: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
}

export interface AppSession {
    user?: AppUser;
}

export interface IDailyMetric {
    ownerId: string;
    date: string;
    totalQueries: number;
    deflectedQueries: number;
    escalatedQueries: number;
}

export interface IUnanswered {
    _id?: string;
    ownerId: string;
    question: string;
    createdAt: string | Date;
}