import { WordContent } from "cafe-types/deck";

type UpdateWordsByIdsRequestData = {
    id: string;
    words: { id: string, content: WordContent }[];
    wordIdsToDelete?: string[];
}

type CreateWordsRequestData = {
    deck_id: string;
    contents: WordContent[]
}

type CreateWordsResponseData = {
    newIds: string[]
}

export type { UpdateWordsByIdsRequestData, CreateWordsRequestData, CreateWordsResponseData };