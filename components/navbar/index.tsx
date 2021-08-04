import { signIn, signOut } from "next-auth/client"
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
import { IoLanguage, IoLogIn } from "react-icons/io5";
import swal from "sweetalert";
const Navbar = () => {
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const { loading, name, avatar, id } = store.user || {};
    const router = useRouter();
    const debouncedSetUserLocale = useCallback(debounce((locale: string) => {
        client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: { locale }
        })
    }, 1000), []);
    const userMenuItems = [{ key: 'PROFILE', title: <div className={styles.avatarDropdownMenuItem}>{t('navbar_profile')}</div> }, null, { key: 'SIGNOUT', title: <div className={styles.avatarDropdownMenuItem}>{t('navbar_signout')}</div> }]
    return <div className={styles.container}>
        <span className={styles.logo} onClick={() => {
            router.push('/')
        }}>{store.t('global_app_name')}</span>
        {(loading === false) && <div className={styles.rightContainer}>
            {/* {name && <span>{name}</span>} */}
            {!id && <div className={styles.navBarRoundButton} onClick={() => signIn()}><IoLogIn /></div>}
            {// eslint-disable-next-line @next/next/no-img-element
                avatar && (
                    <DropdownMenu onItemClicked={(key: string) => {
                        switch (key) {
                            case 'SIGNOUT': {
                                signOut({ callbackUrl: '/' });
                                break;
                            }
                            case 'PROFILE': {
                                alert('not available 😅')
                                break;
                            }
                        }
                    }} items={userMenuItems}>
                        <div className={styles.navBarRoundButton}><img className={styles.avatar} alt={name} src={avatar || "/assets/default_avatar.jpg"} /></div>
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