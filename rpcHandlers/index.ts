import { RPC } from './rpc';
import getDeckByIds from './getDeckByIds';
import getUserInfo from './getUserInfo';
const RPC_HANDLERS = {
    [RPC.RPC_GET_DECK_BY_IDS]: getDeckByIds,
    [RPC.RPC_GET_USER_INFO]: getUserInfo
}

export default RPC_HANDLERS;