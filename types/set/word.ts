import { CustomizedField } from "./customizedField";

type Word = {
    id: string;
    set_id: string;
    created_at: number;
    edited_at: number;
    content: WordContent;
}

type WordContent =
    {
        word: string;
        meaning: string;
        customized_fields: CustomizedField[];
    }


export type { Word, WordContent };