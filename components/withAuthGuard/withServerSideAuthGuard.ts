import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";

export const serverSideAuthGuard: GetServerSideProps = async (context) => {
    const isDev = (process.env.NODE_ENV) === 'development';
    const host = isDev ? 'localhost:3000' : process.env.HOST;
    const session = await getSession(context)
    const protocal = isDev ? 'http' : 'https';
    const protocalWithHost = `${protocal}://${host}`
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