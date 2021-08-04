import { UserData } from "cafe-types/userData";
import React, { useState } from "react";
import getTranslation from "cafe-utils/i18n";
import { Locale } from "cafe-types/i18n";
import { DEFAULT_LOCALE } from "cafe-constants/index";

interface GlobalStoreInterface {
  user?: Partial<UserData> | undefined,
  setUser: React.Dispatch<React.SetStateAction<Partial<UserData> | undefined>>,
  setLocale: (l?: string) => void,
  setAuthenticatingInProgress: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  t: (key: string) => string,
  currentLocale: string,
  authenticatingInProgress?: boolean,
}
export const GlobalStoreContext = React.createContext<GlobalStoreInterface>({
  setUser: ()=>undefined,
  t: getTranslation,
  setLocale: ()=>undefined,
  setAuthenticatingInProgress: ()=>undefined,
  currentLocale: 'EN_US',
  authenticatingInProgress: undefined,
});

export default function GlobalStoreProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const [authenticatingInProgress, setAuthenticatingInProgress] = useState<boolean | undefined>(undefined);
  const [locale, localSetLocale] = useState<string>('');
  const setLocale = (locale?: string) => {
    localSetLocale(locale || DEFAULT_LOCALE)
  }
  const t = (key: string, forceLocale?: string) => {
    return getTranslation(key, (forceLocale || locale || DEFAULT_LOCALE) as Locale);
  }
  const store = {
    user, setUser, t, setLocale, currentLocale: locale, setAuthenticatingInProgress, authenticatingInProgress
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}