import { getSession } from 'next-auth/client'
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const withAuth = (handler: NextApiHandler) => {
    const allowedUsers = ['lolitacon2012@gmail.com', 'dake.liu@sprinklr.com'];
    return async (req: NextApiRequest,
        res: NextApiResponse) => {
        const session = await getSession({ req });
        if (!session || !session.user?.email
            // || (allowedUsers.indexOf(session.user?.email) < 0)
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