import { GlobalStoreContext } from "cafe-store/index";
import { signIn, useSession } from "next-auth/client";

import { useContext, useEffect } from "react";

const useAuthGuard = () => {
    const [session, loading] = useSession();
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
    }, [loading, session])
}

export default useAuthGuard;