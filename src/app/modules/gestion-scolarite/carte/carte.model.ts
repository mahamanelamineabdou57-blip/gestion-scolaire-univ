export interface Carte {
    id: number;
    numero_carte: string;
    inscriptions_id: string;
    date_emission?: Date;
    date_expiration?: Date;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}