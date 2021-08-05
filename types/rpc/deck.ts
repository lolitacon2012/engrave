import { Deck, Word } from "cafe-types/deck";

type GetDeckByIdsRequestData = {
    ids: string[]
}

type CreateDeckRequestData = { deck: Partial<Omit<Deck, "words">>, words: Word[] };
type UpdateDeckRequestData = {
    id: string,
    wordIds: string[]
}
export type { GetDeckByIdsRequestData, CreateDeckRequestData, UpdateDeckRequestData };