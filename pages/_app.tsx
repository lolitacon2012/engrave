import '../styles/globals.css'
import 'react-virtualized/styles.css';
import type { AppContext, AppProps } from 'next/app'
import { Provider } from "next-auth/client"
import GlobalStoreProvider from "cafe-store/index";
import React from 'react';
import Layout from 'cafe-components/layout';

function MyApp({ Component, pageProps }: AppProps) {
  return <Provider session={pageProps.session}>
    <GlobalStoreProvider {...pageProps}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalStoreProvider>
  </Provider>
}

export default MyApp
