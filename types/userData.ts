import { StudyProgress } from "./study";
export type ChangableUserData = {
  owningDeckIds: string[],
  studyingDeckIds: string[],
  progress: { [key: string]: StudyProgress },
  alias: string,
  locale: string,
}
export type UserData = ChangableUserData & {
  loading: boolean;
  id: string,
  registerTime: number,
  avatar: string,
  name: string,
}