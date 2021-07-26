import { useSession, signIn } from "next-auth/client"
import Button from 'cafe-ui/button';
import styles from './index.module.css';
import t from 'cafe-utils/i18n';
const Navbar = () => {
    const [session, loading] = useSession();
    return <div className={styles.container}>
        <span className={styles.logo}>{t('global_app_name')} ☕</span>
        {!loading && <div className={styles.rightContainer}>
            {session && <span>{session?.user?.name}</span>}
            {!session && <Button onClick={() => {
                signIn();
            }}>{t('navbar_signin')}</Button>}
            {// eslint-disable-next-line @next/next/no-img-element
                session && <img className={styles.avatar} src={session?.user?.image || "/assets/default_avatar.jpg"} />}
            {/* {session && <Button onClick={() => {
                signOut();
            }}>{t('navbar_signout')}</Button>} */}

        </div>}
    </div>
}
export default Navbar;