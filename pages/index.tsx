import Head from 'next/head'
import styles from '../styles/Home.module.css'
import t from 'cafe-utils/i18n';
import Navbar from 'cafe-components/navbar';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Qahva</title>
        <meta name="description" content="Qahva - Free flashcard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            {t('homepage_title')}
          </h1>

          <p className={styles.description}>
            Alpha 0.0.1
          </p>

          <div className={styles.grid}>
            <a href="https://nextjs.org/docs" className={styles.card}>
              <h2>Create ✍</h2>
              <p>You can create flashcard decks after login, easy and fast.</p>
            </a>

            <a href="https://nextjs.org/learn" className={styles.card}>
              <h2>Learn 🏆</h2>
              <p>Study a deck and keep track of your progress.</p>
            </a>

            <a
              href="https://github.com/vercel/next.js/tree/master/examples"
              className={styles.card}
            >
              <h2>Share 🐾</h2>
              <p>All decks created can be shared with other users, via link or search.</p>
            </a>

            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              className={styles.card}
            >
              <h2>Donate ☕</h2>
              <p>
                Free forever, but do buy me a Qahva if you like it!
              </p>
            </a>
          </div>
        </main>

        {/* <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className={styles.logo}>
              <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
          </a>
        </footer> */}
      </div>
    </div>
  )
}
