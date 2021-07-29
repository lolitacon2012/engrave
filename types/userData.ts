import { Session } from "next-auth";
import { StudyProgress } from "./study";

export type UserData = {
    loading: boolean;
    id: string,
    registerTime: number,
    owningSetIds: string[],
    studyingSetIds: string[],
    progress: StudyProgress[],
    email: string,
    avatar: string,
    name: string,
  }