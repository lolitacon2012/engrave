import { RPC } from './rpc';
import getDeckByIds from './getDeckByIds';
import updateWordsByIds from './updateWordsByIds';
import getUserInfo from './getUserInfo';
import createDeck from './createDeck';
const RPC_HANDLERS = {
    [RPC.RPC_GET_DECK_BY_IDS]: getDeckByIds,
    [RPC.RPC_GET_USER_INFO]: getUserInfo,
    [RPC.RPC_CREATE_DECK]: createDeck,
    [RPC.RPC_UPDATE_WORDS_BY_IDS]: updateWordsByIds,
}

export default RPC_HANDLERS;