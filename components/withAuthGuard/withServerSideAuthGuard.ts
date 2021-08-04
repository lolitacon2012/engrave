import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";

export const serverSideAuthGuard: GetServerSideProps = async (context) => {
    const isDev = (process.env.NODE_ENV) === 'development';

    const session = await getSession(context)
    const protocal = isDev ? 'http' : 'https';
    const protocalWithHost = `${protocal}://${context.req.headers.host || 'localhost:3000'}`
    const currentRequest = `${protocalWithHost}${context.resolvedUrl}`;
    if (!session) {
        return {
            redirect: {
                destination: `/api/auth/signin?callbackUrl=${encodeURIComponent(currentRequest)}`,
                permanent: false,
            },
        }
    }

    return {
        props: { testProps: 'test' }
    }
}