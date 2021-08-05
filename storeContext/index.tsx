import { UserData } from "cafe-types/userData";
import React, { useState } from "react";
import getTranslation from "cafe-utils/i18n";
import { Locale } from "cafe-types/i18n";
import { DEFAULT_LOCALE } from "cafe-constants/index";
import { Deck } from "cafe-types/deck";
import { StudyProgress } from "cafe-types/study";
const NOOP = ()=>undefined;
interface GlobalStoreInterface {
  user?: Partial<UserData> | undefined,
  setUser: React.Dispatch<React.SetStateAction<Partial<UserData> | undefined>>,
  setLocale: (l?: string) => void,
  setAuthenticatingInProgress: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  setCurrentStudyingDeck: React.Dispatch<React.SetStateAction<Deck | undefined>>,
  currentStudyingDeck?: Deck,
  t: (key: string) => string,
  currentLocale: string,
  authenticatingInProgress?: boolean,
  currentDeckProgress?: Partial<StudyProgress>,
  setCurrentDeckProgress: React.Dispatch<React.SetStateAction<Partial<StudyProgress> | undefined>>,
}
export const GlobalStoreContext = React.createContext<GlobalStoreInterface>({
  setUser: NOOP,
  t: getTranslation,
  setLocale: NOOP,
  setCurrentStudyingDeck: NOOP,
  currentStudyingDeck: undefined,
  setAuthenticatingInProgress: NOOP,
  currentLocale: DEFAULT_LOCALE,
  authenticatingInProgress: undefined,
  currentDeckProgress: undefined,
  setCurrentDeckProgress: NOOP,
});

export default function GlobalStoreProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const [authenticatingInProgress, setAuthenticatingInProgress] = useState<boolean | undefined>(undefined);
  const [locale, localSetLocale] = useState<string>('');
  const [currentStudyingDeck, setCurrentStudyingDeck] = useState<Deck|undefined>(undefined);
  const [currentDeckProgress, setCurrentDeckProgress] = useState<Partial<StudyProgress>|undefined>(undefined);
  const setLocale = (locale?: string) => {
    localSetLocale(locale || DEFAULT_LOCALE)
  }
  const t = (key: string, forceLocale?: string) => {
    return getTranslation(key, (forceLocale || locale || DEFAULT_LOCALE) as Locale);
  }
  const store = {
    currentDeckProgress, setCurrentDeckProgress, user, setUser, t, setLocale, currentLocale: locale, setAuthenticatingInProgress, authenticatingInProgress, setCurrentStudyingDeck, currentStudyingDeck
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}