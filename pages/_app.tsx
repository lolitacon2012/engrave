import '../styles/globals.css'
import 'react-virtualized/styles.css';
// import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import GlobalStoreProvider from "cafe-store/index";
import React from 'react';
import Layout from 'cafe-components/layout';

// Todo: fix typescript issue here
function MyApp({ Component, pageProps }: any) {

  return <SessionProvider session={pageProps.session}>
    <GlobalStoreProvider {...pageProps}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalStoreProvider>
  </SessionProvider>
}

export default MyApp
