import { WordContent } from "cafe-types/set";

type UpdateWordsByIdsRequestData = {
    id: string;
    words: { id: string, content: WordContent }[]
}

export type { UpdateWordsByIdsRequestData };