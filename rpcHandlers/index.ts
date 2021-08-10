import { RPC } from './rpc';
import { updateWordsByIds, createWords } from './wordHandlers';
import { getUserInfo, updateUserInfo } from './userHandlers';
import { updateDeckById, createDeck, getDeckByIds } from './deckHandlers';

const RPC_HANDLERS = {
    [RPC.RPC_GET_DECK_BY_IDS]: getDeckByIds,
    [RPC.RPC_GET_USER_INFO]: getUserInfo,
    [RPC.RPC_CREATE_DECK]: createDeck,
    [RPC.RPC_UPDATE_WORDS_BY_IDS]: updateWordsByIds,
    [RPC.RPC_CREATE_WORDS]: createWords,
    [RPC.RPC_UPDATE_DECK_BY_ID]: updateDeckById,
    [RPC.RPC_UPDATE_USER_INFO]: updateUserInfo,
}

export default RPC_HANDLERS;