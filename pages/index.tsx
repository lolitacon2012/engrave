import Head from 'next/head'
import styles from './index.module.css'
import { useContext } from 'react';
import { useRouter } from 'next/router'
import { GlobalStoreContext } from 'cafe-store/index';

export default function Home() {
  const router = useRouter();
  const store = useContext(GlobalStoreContext);
  const t = store.t;
  store.setLoading(false);
  return (
    <div>
      <Head>
        <title>Qahva</title>
        <meta name="description" content="Qahva - Free vocabulary study tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              <h2>Create ✍</h2>
              <p>You can create flashcard decks after login, easy and fast.</p>
            </a>


            <a onClick={(e) => {
              e.preventDefault();
              router.push('/home')
            }} className={styles.card}>
              <h2>Learn 🏆</h2>
              <p>Study a deck and keep track of your progress.</p>
            </a>

            <a
              onClick={(e) => {
                e.preventDefault();
                router.push('/home')
              }}
              className={styles.card}
            >
              <h2>Share 🐾</h2>
              <p>All decks created can be shared with other users, via link or search.</p>
            </a>

            <a
              onClick={(e) => {
                e.preventDefault();
                router.push('/home')
              }}
              className={styles.card}
            >
              <h2>Donate ☕</h2>
              <p>
                Free forever, but do buy me a Qahva if you like it!
              </p>
            </a>
          </div>
        </main>

        <footer className={styles.footer}>
          <p className={styles.version}>pre-alpha 0.0.1</p>
        </footer>
      </div>
    </div>
  )
}
