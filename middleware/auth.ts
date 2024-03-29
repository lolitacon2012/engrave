import { getSession } from 'next-auth/react'
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const withAuth = (handler: NextApiHandler) => {
    return async (req: NextApiRequest,
        res: NextApiResponse) => {
        const session = await getSession({ req });
        if (!session || !session.user?.email
        ) {
            return res.status(401).json({
                success: false,
                message: 'Please either log in to get access, or contact admin to gain access.',
            });
        } else {
            return handler(req, res);
        }
    };
};

export default withAuth;