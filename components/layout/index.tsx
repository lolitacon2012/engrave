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
import Head from "next/head";

export default function Layout({ children }: { children: React.ReactNode }) {
    const store = React.useContext(GlobalStoreContext);
    const [session, loading] = useSession();
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const isReadyToDisplay = !store.loading;
    useEffect(() => {
        store.setLocale(localStorage.getItem('locale') || '');
    })
    useEffect(() => {
        if (!loading && session) {
            client.callRPC({ rpc: RPC.RPC_GET_USER_INFO, data: {} }).then((result: Partial<UserData>) => {
                store.setUser({
                    ...store.user, ...result, loading: false, email: session.user?.email || '', avatar: session.user?.image || '', name: session.user?.name || ''
                });
                store.setLocale(localStorage.getItem('locale') || result?.locale);
            })
        } else {
            store.setUser({
                loading
            });
        }
    }, [session, loading])
    useEffect(() => {
        isReadyToDisplay && setTimeout(() => {
            setShowLoadingScreen(false)
        }, 350)
    }, [isReadyToDisplay])
    return <>
        <Head>
            <title>Qahva</title>
            <meta name="description" content={"Qahva - " + store.t('homepage_subtitle')} />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar />
        {showLoadingScreen && <div className={cn(styles.loadingScreen, isReadyToDisplay && styles.fadingOut)}>
            <IoCafe className={styles.coffee} />
        </div>}
        <div className={(styles.childContainer)}>{children}</div>
        <footer className={styles.footer}>
            <p className={styles.version}>pre-alpha 0.0.2</p>
            <span className={styles.disclaimer}>DISCLAIMER: This website is still at pre-alpha stage. Any data and information stored on this website is neither guaranteed to be safe, nor persistent. Please use it at your own risk.</span>
        </footer>
    </>;
}