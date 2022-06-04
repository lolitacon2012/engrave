import Container from "cafe-ui/pageContainer";
import styles from "./index.module.css";
import { useRouter } from 'next/router'
import { useSession } from "next-auth/react"
import client from 'cafe-utils/client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";

import useAuthGuard from "hooks/useAuthGuard";
import Button from 'cafe-ui/button';

import classNames from 'classnames';
import modal from "cafe-ui/modal";
import { IoPencil } from "react-icons/io5";
import MorphologyCard from "./morphologyCard";

export default function Profile() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const hasAuthenticated = useAuthGuard();
    const t = store.t;
    const { data: session } = useSession()
    const authFinished = (store.authenticatingInProgress === false);
    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading);
    }, [store.isLocaleLoading || store.isUserLoading])

    return session && store.user && hasAuthenticated && authFinished && (
        <>
            <Container>
                <div className={styles.widthLimiterContainer}>
                    <div className={styles.widthLimiter}>
                        <div className={styles.sectionContainer}>
                            <h1>Morphology</h1>
                        </div>
                        <div className={styles.morphCardsRow}>
                            <MorphologyCard title={"Noun Conj."} id={"test_noun"}></MorphologyCard>
                            <MorphologyCard title={"Verb Conj."} id={"test_verb"}></MorphologyCard>
                            <MorphologyCard></MorphologyCard>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    )
};