import { WordContent } from "cafe-types/set";

type UpdateWordsByIdsRequestData = {
    id: string;
    words: { id: string, content: WordContent }[]
}

type CreateWordsRequestData = {
    set_id: string;
    contents: WordContent[]
}

type CreateWordsResponseData = {
    newIds: string[]
}

export type { UpdateWordsByIdsRequestData, CreateWordsRequestData, CreateWordsResponseData };