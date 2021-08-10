import { UserData } from "cafe-types/userData";
import React, { useState } from "react";
import getTranslation from "cafe-utils/i18n";
import { Locale } from "cafe-types/i18n";
import { DEFAULT_LOCALE } from "cafe-constants/index";
import { Deck } from "cafe-types/deck";
import { StudyProgress } from "cafe-types/study";
import client from "cafe-utils/client";
import { RPC } from "cafe-rpc/rpc";
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
  setError: React.Dispatch<React.SetStateAction<number>>,
  hasError: number;
  updateUser: () => void,
  errorMessageStack: string[],
  setErrorMessageStack: React.Dispatch<React.SetStateAction<string[]>>,
  pushErrorMessageStack: (e: string) => void,
  updateUserLocally: (data: Partial<UserData>) => void;
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
  updateUser: NOOP,
  updateUserLocally: NOOP,
  setError: NOOP,
  hasError: 0,
  errorMessageStack: [],
  setErrorMessageStack: NOOP,
  pushErrorMessageStack: NOOP,
});

export default function GlobalStoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setError] = useState<number>(0);
  const [errorMessageStack, setErrorMessageStack] = useState<string[]>([]);
  const pushErrorMessageStack = (e: string) => {
    setErrorMessageStack([...errorMessageStack, e]);
  }
  const [authenticatingInProgress, setAuthenticatingInProgress] = useState<boolean | undefined>(undefined);
  const [locale, localSetLocale] = useState<string>('');
  const isUserLoading = !!user?.loading || !!authenticatingInProgress;
  const isLocaleLoading = (user?.locale !== locale)
  const setLocale = (locale?: string) => {
    localSetLocale(locale || DEFAULT_LOCALE)
    localStorage?.setItem('locale', locale || DEFAULT_LOCALE)
  }
  const updateUser = () => {
    client.callRPC({ rpc: RPC.RPC_GET_USER_INFO, data: {} }).then(({ data, error }: { data?: Partial<UserData>, error: string }) => {
      setUser({
        ...user, ...data
      });
    })
  }
  const updateUserLocally = (data: Partial<UserData>) => {
    setUser({
      ...user, ...data
    });
  }
  const t = (key: string, placeholder?: { [key: string]: string }) => {
    return getTranslation(key, (locale || DEFAULT_LOCALE) as Locale, placeholder || {});
  }
  const store = {
    updateUserLocally, pushErrorMessageStack, setErrorMessageStack, errorMessageStack, hasError, setError, updateUser, isLocaleLoading, isUserLoading, loading, setLoading, user, setUser, t, setLocale, currentLocale: locale, setAuthenticatingInProgress, authenticatingInProgress,
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}

