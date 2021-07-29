import { Deck } from "cafe-types/set";
import { UserData } from "cafe-types/userData";
import React, { useState } from "react";

interface GlobalStoreInterface {
  user?: Partial<UserData> | undefined,
  setUser: React.Dispatch<React.SetStateAction<Partial<UserData> | undefined>>,
  // getDeckById: (id: string) => Deck | undefined,
  // setDeckById: (id: string, deck: Deck) => void,
}
export const GlobalStoreContext = React.createContext<GlobalStoreInterface>({
  setUser: ()=>undefined,
  // getDeckById: ()=>undefined,
  // setDeckById: ()=>undefined,
});

export default function GlobalStoreProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const [weakDeckMap, setWeakDeckMap] = useState<Map<string, Deck>>(new Map());
  // const getDeckById = (id: string) => weakDeckMap.get(id);
  // const setDeckById = (id: string, deck: Deck) => setWeakDeckMap(prev => new Map([...prev, [id, deck]]))
  const store = {
    user, setUser
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}