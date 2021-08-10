import Head from 'next/head'
import styles from './index.module.css'
import { useContext } from 'react';
import { useRouter } from 'next/router'
import { GlobalStoreContext } from 'cafe-store/index';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const store = useContext(GlobalStoreContext);
  const t = store.t;
  useEffect(() => {
    store.setLoading(false);
  }, [])
  return (
    <div>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            {t('homepage_title')}
          </h1>

          <p className={styles.description}>
            {t('homepage_subtitle')}
          </p>

          <div className={styles.grid}>
            <a className={styles.card}>
              <h2>{t('homepage_subtitle_create')} ✍</h2>
              <p>{t('homepage_subtitle_create_intro')}</p>
            </a>


            <a onClick={(e) => {
              e.preventDefault();
              router.push('/home')
            }} className={styles.card}>
              <h2>{t('homepage_subtitle_learn')} 🏆</h2>
              <p>{t('homepage_subtitle_learn_intro')}</p>
            </a>

            <a
              onClick={(e) => {
                e.preventDefault();
                router.push('/home')
              }}
              className={styles.card}
            >
              <h2>{t('homepage_subtitle_share')} 🐾</h2>
              <p>{t('homepage_subtitle_share_intro')}</p>
            </a>

            <a
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'https://www.buymeacoffee.com/liudake'
              }}
              className={styles.card}
            >
              <h2>{t('homepage_subtitle_support')} ☕</h2>
              <p>{t('homepage_subtitle_support_intro')}</p>
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
