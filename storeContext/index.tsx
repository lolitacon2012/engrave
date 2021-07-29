import { UserData } from "cafe-types/userData";
import React, { useState } from "react";

interface GlobalStoreInterface {
  user?: Partial<UserData> | undefined,
  setUser: React.Dispatch<React.SetStateAction<Partial<UserData> | undefined>>
}
export const GlobalStoreContext = React.createContext<GlobalStoreInterface>({
  setUser: ()=>{}
});

export default function GlobalStoreProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<UserData> | undefined>(undefined);
  const store = {
    user, setUser,
  }
  return <GlobalStoreContext.Provider value={store}>
    {children}
  </GlobalStoreContext.Provider>
}