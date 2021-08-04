import { GlobalStoreContext } from "cafe-store/index";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/client";
import { RPC } from 'cafe-rpc/rpc';
import client from 'cafe-utils/client';
import { UserData } from "cafe-types/userData";
import Navbar from "cafe-components/navbar";
import styles from './index.module.css';
import { IoCafe } from "react-icons/io5";
import cn from "classnames";

export default function Layout({ children }: { children: React.ReactNode }) {
    const store = React.useContext(GlobalStoreContext);
    const [session, loading] = useSession();
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const isReadyToDisplay = !session ? !loading : (!store.authenticatingInProgress && (store.user?.locale === store.currentLocale));
    useEffect(() => {
        if (!loading && session) {
            client.callRPC({ rpc: RPC.RPC_GET_USER_INFO, data: {} }).then((result: Partial<UserData>) => {
                store.setUser({
                    ...store.user, ...result, loading: false, email: session.user?.email || '', avatar: session.user?.image || '', name: session.user?.name || ''
                });
                store.setLocale(result?.locale);
            })
        } else {
            store.setUser({
                loading: true
            });
        }
    }, [session, loading])
    useEffect(()=>{
        isReadyToDisplay && setTimeout(()=>{
            setShowLoadingScreen(false)
        }, 350)
    }, [isReadyToDisplay])
    return <>
        <Navbar />
        {showLoadingScreen && <div className={cn(styles.loadingScreen, isReadyToDisplay && styles.fadingOut)}>
            <IoCafe className={styles.coffee} />
        </div>}
        {children}
    </>;
}