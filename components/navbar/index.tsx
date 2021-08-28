import { signIn, signOut } from "next-auth/client"
import React, { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import styles from './index.module.css';
import { useRouter } from "next/router";
import DropdownMenu from "cafe-ui/dropdownMenu";
import client from "cafe-utils/client";
import { RPC } from "cafe-rpc/rpc";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import { IoBuild, IoLanguage, IoLogIn } from "react-icons/io5";
import classNames from "classnames";
import { useEffect } from "react";
import { useState } from "react";
import { alertDeveloping } from "cafe-ui/modal";

const Navbar = () => {
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const { name, avatar, id, loading: userLoading } = store.user || {};
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [errorStyle, setErrorStyle] = useState(false);
    const debouncedSetUserLocale = useCallback(debounce((locale: string) => {
        client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: { locale }
        })
    }, 0), []);
    const canLogin = !id && !userLoading && !store.authenticatingInProgress;
    const userMenuItems = [{ key: 'PROFILE', title: <div className={styles.avatarDropdownMenuItem}>{t('navbar_profile')}</div> }, null, { key: 'SIGNOUT', title: <div className={styles.avatarDropdownMenuItem}>{t('navbar_signout')}</div> }]
    useEffect(() => {
        if (store.errorMessageStack.length > 0 && !errorMessage) {
            const errorMessage = store.errorMessageStack[0];
            setErrorMessage(errorMessage);
            setErrorStyle(true);
            setTimeout(() => {
                setErrorStyle(false);
            }, 5000)
            setTimeout(() => {
                setErrorMessage('');
                store.setErrorMessageStack([]) // only 1 message is allowed for now
            }, 5500)
        }
    }, [store.errorMessageStack])
    return <div className={classNames(styles.container, errorStyle && styles.error)}>
        <span className={styles.logo} onClick={() => {
            router.push('/')
        }}>{store.t('global_app_name')}</span>
        <span className={classNames(styles.errorMessage, errorStyle && styles.error)}>{
            errorMessage
        }</span>
        {<div className={styles.rightContainer}>
            {/* {name && <span>{name}</span>} */}
            {canLogin && <div className={styles.navBarRoundButton} onClick={() => signIn()}><IoLogIn /></div>}
            {
                avatar && (
                    <DropdownMenu onItemClicked={(key: string) => {
                        switch (key) {
                            case 'SIGNOUT': {
                                signOut({ callbackUrl: '/' });
                                break;
                            }
                            case 'PROFILE': {
                                alertDeveloping(t);
                                break;
                            }
                        }
                    }} items={userMenuItems}>
                        {// eslint-disable-next-line @next/next/no-img-element
                            <div className={styles.navBarRoundButton}><img className={styles.avatar} alt={name} src={avatar || "/assets/default_avatar.jpg"} /></div>}
                    </DropdownMenu>)}
            {(
                <DropdownMenu onItemClicked={(action: string) => {
                    switch (action) {
                        case 'verbConjugation': {
                            router.push('/tools/japanese_verb_katsuyou');
                        }
                    }
                }} items={[{ key: 'verbConjugation', title: t('navbar_tools_conjugation') }]}>
                    <div className={styles.navBarRoundButton}><IoBuild /></div>
                </DropdownMenu>)}
            {(
                <DropdownMenu onItemClicked={(locale: string) => {
                    store.setLocale(locale);
                    id && debouncedSetUserLocale(locale);
                }} items={[{ key: 'EN_US', title: 'English' }, { key: 'ZH_CN', title: '简体中文' }]}>
                    <div className={styles.navBarRoundButton}><IoLanguage /></div>
                </DropdownMenu>)}

        </div>}
    </div>
}
export default Navbar;