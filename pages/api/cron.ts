// starts cron job

import withAuth from 'cafe-middleware/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import cron from 'node-cron';

type CronLog = {
    [key: string]: string
}

const cronLog: CronLog[] = [];

cron.schedule('* 15 * * * *', (now) => {
    if (typeof now !== 'string') {
        cronLog.unshift({
            [now.toISOString()]: "cron executed"
        })
        if (cronLog.length > 100) {
            cronLog.pop();
        }
    }
});

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    if (req.method === 'GET') {
        res.json(cronLog);
    } else {
        res.json({ error: 404, errorMessage: "No such handler is found." })
    }
}

export default withAuth(handler);