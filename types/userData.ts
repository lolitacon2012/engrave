import { StudyProgress } from "./study";
export type ChangableUserData = {
  owningSetIds: string[],
  studyingSetIds: string[],
  progress: StudyProgress[],
  alias: string,
  locale: string,
}
export type UserData = ChangableUserData & {
  loading: boolean;
  id: string,
  registerTime: number,
  email: string,
  avatar: string,
  name: string,
}