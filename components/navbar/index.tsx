import { signIn } from "next-auth/client"
import { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import Button from 'cafe-ui/button';
import styles from './index.module.css';
import t from 'cafe-utils/i18n';
const Navbar = () => {
    const store = useContext(GlobalStoreContext);
    const { loading, name, email, avatar} = store.user || {};
    return <div className={styles.container}>
        <span className={styles.logo}>{t('global_app_name')} ☕</span>
        {!loading && <div className={styles.rightContainer}>
            {name && <span>{name}</span>}
            {!name && <Button onClick={() => {
                signIn();
            }}>{t('navbar_signin')}</Button>}
            {// eslint-disable-next-line @next/next/no-img-element
                avatar && <img className={styles.avatar} src={avatar || "/assets/default_avatar.jpg"} />}
            {/* {session && <Button onClick={() => {
                signOut();
            }}>{t('navbar_signout')}</Button>} */}

        </div>}
    </div>
}
export default Navbar;