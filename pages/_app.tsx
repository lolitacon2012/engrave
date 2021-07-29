import '../styles/globals.css'
import 'react-virtualized/styles.css';
import type { AppProps } from 'next/app'
import { Provider } from "next-auth/client"
import GlobalStoreProvider from "cafe-store/index";
import React from 'react';
import Layout from 'cafe-components/layout';

function MyApp({ Component, pageProps }: AppProps) {
  return <Provider session={pageProps.session}>
    <GlobalStoreProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalStoreProvider>
  </Provider>
}
export default MyApp
