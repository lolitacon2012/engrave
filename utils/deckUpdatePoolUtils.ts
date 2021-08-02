import { RPC } from "cafe-rpc/rpc";
import { WordContent } from "cafe-types/set"
import client from "./client";

const WORD_ID_PENDING = 'WORD_ID_PENDING';
const DECK_WORD_ID_LIST = 'DECK_WORD_ID_LIST';

export const addDeckWordUpdatePool = (wordId: string, content: WordContent) => {
    const existingPendingWord = JSON.parse(localStorage.getItem(wordId) || '{}');
    existingPendingWord.content = content;
    localStorage.setItem(wordId, JSON.stringify(existingPendingWord));
    let pendingWordIds = JSON.parse(localStorage.getItem(WORD_ID_PENDING) || '[]');
    if (pendingWordIds.indexOf(wordId) < 0) {
        localStorage.setItem(WORD_ID_PENDING, JSON.stringify([...pendingWordIds, wordId]));
    }
}

export const addDeckWordInsertPool = (wordIds: string[]) => {
    localStorage.setItem(DECK_WORD_ID_LIST, JSON.stringify(wordIds));
}

export const commitDeckChange = (deckId: string) => {
    const pendingWordIds = JSON.parse(localStorage.getItem(WORD_ID_PENDING) || '[]');
    const pendingWords = pendingWordIds.map((id: string) => {
        return { ...JSON.parse(localStorage.getItem(id) || 'null'), id }
    })
    const newWordIdList = JSON.parse(localStorage.getItem(DECK_WORD_ID_LIST) || 'null');
    newWordIdList && client.callRPC({
        rpc: RPC.RPC_UPDATE_DECK_BY_ID,
        data: {
            id: deckId,
            wordIds: newWordIdList,
        }
    });

    client.callRPC({
        rpc: RPC.RPC_UPDATE_WORDS_BY_IDS,
        data: {
            id: deckId,
            words: pendingWords
        }
    });
    
    localStorage.removeItem(DECK_WORD_ID_LIST);
    localStorage.removeItem(WORD_ID_PENDING);
    pendingWordIds.forEach((id: string) => localStorage.removeItem(id));
    const deckRelatedCacheEntries = Object.entries(localStorage);
    deckRelatedCacheEntries.forEach((pair) => {
        if (pair[0].indexOf(RPC.RPC_GET_DECK_BY_IDS) >= 0) {
            localStorage.removeItem(pair[0]);
        }
    })
}