import type { Action } from "./Action";

export interface It {
    name: string;
    actions: Action[];
    options: Record<string, any>[];
} 