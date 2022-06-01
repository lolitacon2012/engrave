import { GlobalStoreContext } from "cafe-store/index";
import { signIn, useSession } from "next-auth/react";

import { useContext, useEffect } from "react";

const useAuthGuard = () => {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const authenticated = status === "authenticated";
    const store = useContext(GlobalStoreContext)
    useEffect(() => {
        if (loading === false) {
            if (!session) {
                signIn(undefined, { callbackUrl: window.location.href });
            } else {
                store.setAuthenticatingInProgress(false);
            }
        } else {
            store.setAuthenticatingInProgress(true);
        }
    }, [loading, session, authenticated])
    return authenticated;
}

export default useAuthGuard;