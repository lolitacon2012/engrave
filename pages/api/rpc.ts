import type { NextApiRequest, NextApiResponse } from 'next';
import withAuth from './../../middleware/auth';
import RPC_HANDLERS from './../../rpcHandlers';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === 'POST') {
    const rpcName = (req.body || {})['rpc'];
    const data = (req.body || {})['data'];
    const rpcHandler = RPC_HANDLERS[rpcName];
    if(!rpcName){
      res.json({error: 400, errorMessage: "No rpc name is provided."})
    }else if(!data){
      res.json({error: 400, errorMessage: "No rpc data is provided."})
    }else if(!rpcHandler){
      res.json({error: 400, errorMessage: "No rpc hander is found."})
    }
    const result = await rpcHandler(data, req);
    res.json(result);
  }else{
    res.json({error: 404, errorMessage: "No such handler is found."})
  }
}

export default withAuth(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}