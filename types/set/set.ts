import { Word } from "./word";

type Deck = {
    id: string;
    creator_id: string;
    creator_name: string;
    creator_avatar: string;
    created_at: number;
    edited_at: number;
    words: Word[];
    name: string;
    avatar: string;
    color?: string;
}

export type { Deck };