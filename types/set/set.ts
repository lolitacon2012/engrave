import { Word } from "./word";

type Deck = {
    id: string;
    creator_id: string;
    created_at: number;
    edited_at: number;
    words: Word[];
}

export type { Deck };