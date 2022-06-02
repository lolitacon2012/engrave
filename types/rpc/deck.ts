import { Deck, Word } from "cafe-types/deck";

type GetDeckByIdsRequestData = {
    ids: string[]
}

type CreateDeckRequestData = { deck: Partial<Omit<Deck, "words">>, words: Word[] };
type UpdateDeckRequestData = { id: string } & Partial<{
    wordIds?: string[],
    name: string,
    avatar: string,
    color: string,
}>

type DeleteDeckByIdRequestData = {
    id: string
}
export type { GetDeckByIdsRequestData, CreateDeckRequestData, UpdateDeckRequestData, DeleteDeckByIdRequestData };