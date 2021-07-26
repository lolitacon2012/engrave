import { getSession } from 'next-auth/client'
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const withAuth = (handler: NextApiHandler) => {
    return async (req: NextApiRequest,
        res: NextApiResponse) => {
        const session = await getSession({ req });
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to get access.',
            });
        } else {
            return handler(req, res);
        }
    };
};

export default withAuth;