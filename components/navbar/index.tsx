import { signIn } from "next-auth/client"
import React, { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import Button from 'cafe-ui/button';
import styles from './index.module.css';
import { useRouter } from "next/router";
import DropdownMenu from "cafe-ui/dropdownMenu";
import client from "cafe-utils/client";
import { RPC } from "cafe-rpc/rpc";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import { IoLanguage } from "react-icons/io5";
const Navbar = () => {
    const store = useContext(GlobalStoreContext);
    const { loading, name, avatar, id } = store.user || {};
    const router = useRouter();
    const debouncedSetUserLocale = useCallback(debounce((locale: string) => {
        client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: { locale }
        })
    }, 1000), []);
    return <div className={styles.container}>
        <span className={styles.logo} onClick={() => {
            router.push('/')
        }}>{store.t('global_app_name')} ☕</span>
        {(loading === false) && <div className={styles.rightContainer}>
            {/* {name && <span>{name}</span>} */}
            {!name && <Button onClick={() => {
                signIn();
            }}>{store.t('navbar_signin')}</Button>}
            {// eslint-disable-next-line @next/next/no-img-element
                avatar && <img className={styles.avatar} alt={name} src={avatar || "/assets/default_avatar.jpg"} />}

            {/* {session && <Button onClick={() => {
                signOut();
            }}>{t('navbar_signout')}</Button>} */}
            {id && (
                <DropdownMenu onItemClicked={(locale: string) => {
                    store.setLocale(locale);
                    debouncedSetUserLocale(locale);
                }} items={[{ key: 'EN_US', title: 'English' }, { key: 'ZH_CN', title: '简体中文' }]}>
                    <div className={styles.navBarRoundButton}><IoLanguage /></div>
                </DropdownMenu>)}
        </div>}
    </div>
}
export default Navbar;