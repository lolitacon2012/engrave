import '../styles/globals.css'
import 'react-virtualized/styles.css';
import type { AppContext, AppProps } from 'next/app'
import { Provider } from "next-auth/client"
import GlobalStoreProvider from "cafe-store/index";
import React from 'react';
import Layout from 'cafe-components/layout';
import { getSession } from 'next-auth/client'
import { getLocaleFromAcceptLanguagesHeader } from 'cafe-utils/i18n';

function MyApp({ Component, pageProps }: AppProps) {
  return <Provider session={pageProps.session}>
    <GlobalStoreProvider {...pageProps}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalStoreProvider>
  </Provider>
}


MyApp.getInitialProps = async (context: AppContext) => {
  const req = context.ctx.req;
  const session = await getSession();
  const isServer = !!context.ctx.req;
  let locale = '';
  if (isServer) {
    const supportedLocales = req?.headers['accept-language'] || 'en-US,en;q=0.9';
    locale = getLocaleFromAcceptLanguagesHeader(supportedLocales);
  }
  return {
    pageProps: {
      session,
      locale,
      isServer,
    }
  }
}
export default MyApp
