import Container from "cafe-ui/pageContainer";
import styles from "./profile.module.css";
import { useRouter } from 'next/router'
import { useSession } from "next-auth/react"
import client from 'cafe-utils/client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";
import { Deck } from "cafe-types/deck";
import DeckCard from "cafe-components/deckCard";
import useAuthGuard from "hooks/useAuthGuard";
import { ImageUploader } from "cafe-ui/imageUploader";
import Button from 'cafe-ui/button';
import { NEW_PROGRESS_TEMPLATE, RECOMMEND_THEME_COLORS } from 'cafe-constants/index';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
import { Switch } from 'cafe-ui/switch';
import classNames from 'classnames';
import modal from "cafe-ui/modal";
import { IoPencil } from "react-icons/io5";

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
    const [editingAlias, setEditingAlias] = useState(false);
    const [aliasEditorValue, setAliasEditorValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const updateAlias = async () => {
        if (aliasEditorValue !== store.user?.alias || store.user?.name) {
            await client.callRPC({
                rpc: RPC.RPC_UPDATE_USER_INFO,
                data: { alias: aliasEditorValue.trim() }
            })
        }
        await store.updateUser();
        setEditingAlias(false);
    }
    return session && store.user && hasAuthenticated && authFinished && (
        <>
            <Container>
                <div className={styles.widthLimiterContainer}>
                    <div className={styles.widthLimiter}>
                        <div className={styles.topCardContainer}>
                            <img className={styles.avatar} src={store.user?.avatar} />
                            <h1 style={{
                                visibility: editingAlias ? "hidden" : "visible"
                            }} onClick={() => {
                                setEditingAlias(true);
                                setAliasEditorValue(store.user?.alias || store.user?.name || '');
                                setTimeout(() => {
                                    inputRef.current?.focus()
                                }, 1)
                            }} className={styles.name}>{store.user?.alias || store.user?.name}<span className={styles.editAlias}><IoPencil /></span></h1>
                            {editingAlias && <input ref={inputRef} onChange={(e) => {
                                setAliasEditorValue(e.currentTarget.value);
                            }} value={aliasEditorValue} className={styles.nameEditor} onBlur={() => {
                                updateAlias();
                            }} />}
                            <span className={styles.email}>{session.user?.email}</span>
                        </div></div></div>
            </Container>
        </>
    )
};