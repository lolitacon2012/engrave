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
import Button from "cafe-ui/button";
import { Router, useRouter } from "next/router";
import modal from "cafe-ui/modal";

export default function Layout({ children }: { children: React.ReactNode }) {
    const store = React.useContext(GlobalStoreContext);
    const t = store.t;
    const [session, loading] = useSession();
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const isReadyToDisplay = store.hasError || !store.loading;
    const router = useRouter();
    useEffect(() => {
        store.setLocale(localStorage.getItem('locale') || '');
        client.setRpcOnErrorMessage((e: string) => {
            store.pushErrorMessageStack(e);
        })
    }, [])
    useEffect(() => {
        const onRouterChange = (url: string) => {
            modal.closeAll();
            store.setError(0);
        }
        Router.events.on('routeChangeStart', onRouterChange);
        return () => {
            Router.events.off('routeChangeStart', onRouterChange);
        }
    }, [])
    useEffect(() => {
        if (!loading && session) {
            client.callRPC({ rpc: RPC.RPC_GET_USER_INFO, data: {} }).then(({ data, error }: { data?: Partial<UserData>, error: string }) => {
                store.setUser({
                    ...store.user, ...data, loading: false
                });
                store.setLocale(data?.locale);
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

    const renderError = () => {
        const code = store.hasError + '';
        const errorText = t('error_' + code);
        const hasNoProperErrorMessage = errorText === 'error_' + code;
        return (
            <div className={styles.error404Container}>
                <h3>{code} - {t(hasNoProperErrorMessage ? 'error_unknown' : 'error_' + code)}</h3>
                <Button onClick={() => {
                    window.location.replace('/');
                }}>{t('general_back_to_homepage')}</Button>
            </div>
        )
    }
    return <>
        <Head>
            <title>Qahva</title>
            <meta name="description" content={"Qahva - " + t('homepage_subtitle')} />
            <link rel="icon" href="/favicon.ico" />
            <link
                href="https://fonts.googleapis.com/css2?family=Red+Hat+Display&display=swap"
                rel="stylesheet"
            />
        </Head>
        <Navbar />
        {showLoadingScreen && <div className={cn(styles.loadingScreen, isReadyToDisplay && styles.fadingOut)}>
            <IoCafe className={styles.coffee} />
        </div>}
        {store.hasError ? renderError() : <div className={(styles.childContainer)}>{children}</div>}
        <footer className={styles.footer}>
            <span className={styles.disclaimer}>DISCLAIMER: This website is still at pre-alpha stage. Any data and information stored on this website is neither guaranteed to be safe, nor persistent. Please use it at your own risk.</span>
        </footer>
    </>;
}