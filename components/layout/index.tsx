import { GlobalStoreContext } from "cafe-store/index";
import React, { useEffect } from "react";
import { useSession } from "next-auth/client";
import { RPC } from 'cafe-rpc/rpc';
import client from 'cafe-utils/client';
import { UserData } from "cafe-types/userData";
import Navbar from "cafe-components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const store = React.useContext(GlobalStoreContext);
    const [session, loading] = useSession();
    useEffect(() => {
        if (!loading && session) {
            client.callRPC({ rpc: RPC.RPC_GET_USER_INFO, data: {} }).then((result: Partial<UserData>) => {
                store.setUser({
                    ...store.user, ...result, loading: false, email: session.user?.email || '', avatar: session.user?.image || '', name: session.user?.name || ''
                });
            })
        } else {
            store.setUser({
                loading
            });
        }
    }, [session, loading])
    return <>
        <Navbar />
        {children}
    </>;
}