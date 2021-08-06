import { UserData } from "cafe-types/userData";
import React, { useState } from "react";
import getTranslation from "cafe-utils/i18n";
import { Locale } from "cafe-types/i18n";
import { DEFAULT_LOCALE } from "cafe-constants/index";
import { Deck } from "cafe-types/deck";
import { StudyProgress } from "cafe-types/study";
const NOOP = () => undefined;
interface GlobalStoreInterface {
  user?: Partial<UserData> | undefined,
  setUser: React.Dispatch<React.SetStateAction<Partial<UserData> | undefined>>,
  setLocale: (l?: string) => void,
  setAuthenticatingInProgress: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  t: (key: string, placeholder?: { [key: string]: string }) => string,
  currentLocale: string,
  authenticatingInProgress?: boolean,
  loading?: boolean,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  isUserLoading: boolean,
  isLocaleLoading: boolean,
}
export const GlobalStoreContext = React.createContext<GlobalStoreInterface>({
  setUser: NOOP,
  t: () => '',
  setLocale: NOOP,
  setAuthenticatingInProgress: NOOP,
  currentLocale: DEFAULT_LOCALE,
  authenticatingInProgress: undefined,
  loading: true,
  setLoading: NOOP,
  isUserLoading: true,
  isLocaleLoading: true,
});

export default function GlobalStoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticatingInProgress, setAuthenticatingInProgress] = useState<boolean | undefined>(undefined);
  const [locale, localSetLocale] = useState<string>('');
  const isUserLoading = !!user?.loading || !!authenticatingInProgress;
  const isLocaleLoading = (user?.locale !== locale)
  const setLocale = (locale?: string) => {
    localSetLocale(locale || DEFAULT_LOCALE)
  }
  const t = (key: string, placeholder?: { [key: string]: string }) => {
    return getTranslation(key, (locale || DEFAULT_LOCALE) as Locale, placeholder || {});
  }
  const store = {
    isLocaleLoading, isUserLoading, loading, setLoading, user, setUser, t, setLocale, currentLocale: locale, setAuthenticatingInProgress, authenticatingInProgress,
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}