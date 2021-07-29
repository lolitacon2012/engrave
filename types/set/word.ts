import { CustomizedField } from "./customizedField";

type Word = {
    id: string;
    creator_id: string;
    creator_name: string;
    creator_avatar: string;
    set_id: string;
    content: {
        word: string;
        meaning: string;
        customized_fields: CustomizedField[];
    }
}

export type { Word };