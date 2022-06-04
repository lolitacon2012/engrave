import { CustomizedField } from "./customizedField";

type Word = {
    id: string;
    deck_id: string;
    created_at: number;
    edited_at: number;
    creator_id: string;
    content: WordContent;
}

type WordContent =
    {
        word: string;
        meaning: string;
        customized_fields: CustomizedField[];
        morphology?: {
            morphology_id: string,
            content: string[][]
        };
    }


export type { Word, WordContent };