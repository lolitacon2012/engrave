import { signIn, useSession } from "next-auth/client";
import { useEffect } from "react";

const useAuthGuard = () => {
    const [session, loading] = useSession();
    useEffect(() => {
        if (loading === false) {
            if (!session) {
                signIn(undefined, { callbackUrl: window.location.href });
            }
        }
    }, [loading, session])
    const goodToGo = !loading && session;
    return goodToGo;
}

export default useAuthGuard;